import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { BattleDiplomacyHelper } from "@/engine/combat/battle-diplomacy-helper";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { BitPackedProvinceConqueror } from "@/engine/combat/final/bit-packed-province-conqueror";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";
import { RankManager } from "@/engine/politics/rank-manager";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): GameState {
    const canonicalAttackerId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefenderId = CountryRegistry.resolveCanonicalId(
      action.targetNationId,
    );

    const attacker =
      state.nations[action.nationId] || state.nations[canonicalAttackerId];
    const defender =
      state.nations[action.targetNationId] ||
      state.nations[canonicalDefenderId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const currentStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );

    const betrayalResult =
      BattleDiplomacyHelper.evaluateBetrayalPenalty(currentStance);

    let navalCostMultiplier: number | undefined = undefined;
    if (action.attackType === "NAVAL" && action.targetProvinceId) {
      const navalInfo = NavalNeighborResolver.resolveNavalAttack(
        action.targetProvinceId,
        attacker.id,
        state.provinces,
        action.infantryToDeploy || attacker.military.infantry,
        action.airForceToDeploy || attacker.military.airForce,
        action.dronesToLaunch,
      );
      if (navalInfo.isNavalValid) {
        navalCostMultiplier = navalInfo.navalCostMultiplier;
      }
    }

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      action.infantryToDeploy,
      action.airForceToDeploy,
      action.targetEnclaveId,
      action.attackType,
      navalCostMultiplier,
    );

    const updatedProvinces = { ...state.provinces };
    let conqueredProvinceId: number | null = null;
    let conqueredPixels = 0;

    const defenderProvincesListBefore = Object.values(updatedProvinces).filter(
      (p) =>
        p.ownerNationId === defender.id ||
        p.ownerNationId === canonicalDefenderId,
    );
    const defenderTotalPixels =
      defenderProvincesListBefore.reduce((sum, p) => sum + p.pixelCount, 0) ||
      defender.geography.territoryPixelCount ||
      1;

    if (calcResult.isAttackerVictory) {
      if (
        action.targetProvinceId &&
        updatedProvinces[action.targetProvinceId.toString()]
      ) {
        conqueredProvinceId = action.targetProvinceId;
      } else if (defenderProvincesListBefore.length > 0) {
        const sorted = [...defenderProvincesListBefore].sort(
          (a, b) => b.pixelCount - a.pixelCount,
        );
        conqueredProvinceId = sorted[0]!.provinceId;
      }

      if (conqueredProvinceId) {
        const targetProv = updatedProvinces[conqueredProvinceId.toString()];
        if (targetProv) {
          updatedProvinces[conqueredProvinceId.toString()] = {
            ...targetProv,
            ownerNationId: attacker.id,
          };

          conqueredPixels = targetProv.pixelCount;

          const attackerNumericId = CountryRegistry.resolveNumericId(
            attacker.id,
          );
          const buffer = BitPackedGridState.getInstance().getBuffer();
          BitPackedProvinceConqueror.conquerProvince(
            buffer,
            conqueredProvinceId,
            attackerNumericId,
          );
          BitPackedGridState.getInstance().markDirty();
        }
      }
    }

    const remainingDefenderProvincesList = Object.values(
      updatedProvinces,
    ).filter(
      (p) =>
        p.ownerNationId === defender.id ||
        p.ownerNationId === canonicalDefenderId,
    );
    const defenderRemainingPixels = remainingDefenderProvincesList.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const isDefenderAlive = remainingDefenderProvincesList.length > 0;
    const isFullCapitulation = !isDefenderAlive;

    const provinceRatio = calcResult.isAttackerVictory
      ? Math.min(1.0, conqueredPixels / (defenderTotalPixels || 1))
      : 0;

    const transferredPopulation = calcResult.isAttackerVictory
      ? Math.floor(defender.population * provinceRatio)
      : 0;
    const transferredCapacity = calcResult.isAttackerVictory
      ? Math.floor(
          (defender.maxPopulationCapacity ||
            Math.floor(defender.population / 0.95)) * provinceRatio,
        )
      : 0;
    const treasuryLooted = calcResult.isAttackerVictory
      ? Math.floor(Math.max(0, defender.treasury) * provinceRatio)
      : 0;

    const attackerTreasuryAfterDeployment =
      attacker.treasury - calcResult.deploymentMoneyCost;

    const attackerProvincesList = Object.values(updatedProvinces).filter(
      (p) =>
        p.ownerNationId === attacker.id ||
        p.ownerNationId === canonicalAttackerId,
    );
    const attackerTotalPixels = attackerProvincesList.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );

    const newAttackerMaxCapacity =
      (attacker.maxPopulationCapacity ||
        Math.floor(attacker.population / 0.95)) + transferredCapacity;

    const attackerWithUpdatedCapacity: typeof attacker = {
      ...attacker,
      maxPopulationCapacity: newAttackerMaxCapacity,
      geography: {
        ...attacker.geography,
        territoryPixelCount: attackerTotalPixels,
      },
    };

    let updatedAttacker = GdpCalculator.syncNationGdpAndDemographics(
      attackerWithUpdatedCapacity,
      attacker.population + transferredPopulation,
    );

    const updatedAttackerMilitary = MilitaryInventoryHelper.applyCasualties(
      attacker.military,
      calcResult.attackerCasualties.infantryLost,
      calcResult.attackerCasualties.armorLost,
      calcResult.attackerCasualties.airDefenseLost,
      calcResult.attackerCasualties.airForceLost,
      calcResult.dronesUsed,
      calcResult.attackerCasualties.navalFleetLost,
    );

    updatedAttacker = {
      ...updatedAttacker,
      treasury: attackerTreasuryAfterDeployment + treasuryLooted,
      military: {
        ...updatedAttackerMilitary,
        experience: Math.min(100, attacker.military.experience + 5),
      },
    };

    if (betrayalResult.hasBetrayed) {
      updatedAttacker = BattleDiplomacyHelper.applyReputationPenalty(
        updatedAttacker,
        betrayalResult.reputationPenalty,
      );
    }

    const attackerRelKey = updatedAttacker.relations[defender.id]
      ? defender.id
      : canonicalDefenderId;
    const attackerRelToDefender = updatedAttacker.relations[attackerRelKey];
    if (attackerRelToDefender) {
      updatedAttacker.relations = {
        ...updatedAttacker.relations,
        [attackerRelKey]: {
          ...attackerRelToDefender,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: Math.min(-50, attackerRelToDefender.opinion - 40),
        },
      };
    }

    const newDefenderPop = isDefenderAlive
      ? Math.max(0, defender.population - transferredPopulation)
      : 0;
    const newDefenderCap = isDefenderAlive
      ? Math.max(
          0,
          (defender.maxPopulationCapacity ||
            Math.floor(defender.population / 0.95)) - transferredCapacity,
        )
      : 0;

    const defenderWithUpdatedCapacity: typeof defender = {
      ...defender,
      maxPopulationCapacity: newDefenderCap,
      geography: {
        ...defender.geography,
        territoryPixelCount: defenderRemainingPixels,
      },
    };

    let updatedDefender = GdpCalculator.syncNationGdpAndDemographics(
      defenderWithUpdatedCapacity,
      newDefenderPop,
    );

    const updatedDefenderMilitary = MilitaryInventoryHelper.applyCasualties(
      defender.military,
      calcResult.defenderCasualties.infantryLost,
      calcResult.defenderCasualties.armorLost,
      calcResult.defenderCasualties.airDefenseLost,
      calcResult.defenderCasualties.airForceLost,
      0,
      calcResult.defenderCasualties.navalFleetLost,
    );

    updatedDefender = {
      ...updatedDefender,
      isAlive: isDefenderAlive,
      treasury: isDefenderAlive
        ? Math.max(0, defender.treasury - treasuryLooted)
        : 0,
      military: {
        ...updatedDefenderMilitary,
        experience: Math.min(100, defender.military.experience + 3),
      },
    };

    const defenderRelKey = updatedDefender.relations[attacker.id]
      ? attacker.id
      : canonicalAttackerId;
    const defenderRelToAttacker = updatedDefender.relations[defenderRelKey];
    if (defenderRelToAttacker) {
      updatedDefender.relations = {
        ...updatedDefender.relations,
        [defenderRelKey]: {
          ...defenderRelToAttacker,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: -100,
        },
      };
    }

    let betrayalText = "";
    if (betrayalResult.hasBetrayed) {
      betrayalText = ` [جریمه خیانت دیپلماتیک: -${betrayalResult.reputationPenalty} پرستیژ جهانی]`;
    }

    const { logEntry } = BattleDiplomacyHelper.buildBattleReportAndLog(
      state,
      attacker,
      defender,
      calcResult,
      conqueredPixels,
      isFullCapitulation,
      betrayalText,
    );

    const tempNations = {
      ...state.nations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const rankedNations = RankManager.recalculateRanks(tempNations);

    const newState = {
      ...state,
      provinces: updatedProvinces,
      nations: rankedNations,
      turnLogs: [...state.turnLogs, logEntry],
    };

    if (newState.turnLogs.length > 200) {
      newState.turnLogs.splice(0, newState.turnLogs.length - 200);
    }

    return newState;
  }
}
