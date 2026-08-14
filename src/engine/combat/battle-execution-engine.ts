import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { BattleDiplomacyHelper } from "@/engine/combat/battle-diplomacy-helper";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";
import { RankManager } from "@/engine/politics/rank-manager";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { AllianceInterventionEvaluator } from "@/engine/combat/alliance-intervention-evaluator";

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
      action.attackType,
      navalCostMultiplier,
    );

    const updatedProvinces = { ...state.provinces };

    const defenderProvincesBefore = Object.values(updatedProvinces).filter(
      (p) =>
        p.ownerNationId === defender.id ||
        p.ownerNationId === canonicalDefenderId,
    );
    const defenderTotalPixels =
      defenderProvincesBefore.reduce((sum, p) => sum + p.pixelCount, 0) ||
      defender.geography.territoryPixelCount ||
      1;

    let conqueredPixels = 0;

    if (calcResult.isAttackerVictory) {
      if (calcResult.isFullCapitulation) {
        for (const prov of defenderProvincesBefore) {
          updatedProvinces[prov.provinceId.toString()] = {
            ...prov,
            ownerNationId: attacker.id,
          };
          conqueredPixels += prov.pixelCount;
        }
        BitPackedGridState.getInstance().markDirty();
      } else {
        let conqueredProvId: number | null = null;
        if (
          action.targetProvinceId &&
          updatedProvinces[action.targetProvinceId.toString()]
        ) {
          conqueredProvId = action.targetProvinceId;
        } else if (defenderProvincesBefore.length > 0) {
          const sorted = [...defenderProvincesBefore].sort(
            (a, b) => b.pixelCount - a.pixelCount,
          );
          conqueredProvId = sorted[0]!.provinceId;
        }

        if (conqueredProvId) {
          const targetProv = updatedProvinces[conqueredProvId.toString()];
          if (targetProv) {
            updatedProvinces[conqueredProvId.toString()] = {
              ...targetProv,
              ownerNationId: attacker.id,
            };
            conqueredPixels = targetProv.pixelCount;
            BitPackedGridState.getInstance().markDirty();
          }
        }
      }
    }

    const remainingDefenderProvinces = Object.values(updatedProvinces).filter(
      (p) =>
        p.ownerNationId === defender.id ||
        p.ownerNationId === canonicalDefenderId,
    );
    const isDefenderAlive =
      remainingDefenderProvinces.length > 0 && !calcResult.isFullCapitulation;
    const defenderRemainingPixels = remainingDefenderProvinces.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const defenderProvIds = remainingDefenderProvinces.map((p) => p.provinceId);

    const transferredRatio = calcResult.isAttackerVictory
      ? calcResult.isFullCapitulation
        ? 1.0
        : Math.min(1.0, conqueredPixels / (defenderTotalPixels || 1))
      : 0;

    const transferredPopulation = Math.floor(
      defender.population * transferredRatio,
    );
    const transferredCapacity = Math.floor(
      (defender.maxPopulationCapacity ||
        Math.floor(defender.population / 0.95)) * transferredRatio,
    );

    const attackerProvinces = Object.values(updatedProvinces).filter(
      (p) =>
        p.ownerNationId === attacker.id ||
        p.ownerNationId === canonicalAttackerId,
    );
    const attackerTotalPixels = attackerProvinces.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const attackerProvIds = attackerProvinces.map((p) => p.provinceId);

    let updatedAttackerMilitary = MilitaryInventoryHelper.applyCasualties(
      attacker.military,
      calcResult.attackerCasualties.infantryLost,
      calcResult.attackerCasualties.armorLost,
      calcResult.attackerCasualties.airDefenseLost,
      calcResult.attackerCasualties.airForceLost,
      calcResult.dronesUsed,
      calcResult.attackerCasualties.navalFleetLost,
    );

    if (calcResult.capturedInfantry > 0) {
      updatedAttackerMilitary = MilitaryInventoryHelper.addUnits(
        updatedAttackerMilitary,
        "INFANTRY",
        calcResult.capturedInfantry,
        defender.military.techLevel,
      );
    }
    if (calcResult.capturedArmor > 0) {
      updatedAttackerMilitary = MilitaryInventoryHelper.addUnits(
        updatedAttackerMilitary,
        "ARMOR",
        calcResult.capturedArmor,
        defender.military.techLevel,
      );
    }
    if (calcResult.capturedAirDefense > 0) {
      updatedAttackerMilitary = MilitaryInventoryHelper.addUnits(
        updatedAttackerMilitary,
        "AIR_DEFENSE",
        calcResult.capturedAirDefense,
        defender.military.techLevel,
      );
    }
    if (calcResult.capturedAirForce > 0) {
      updatedAttackerMilitary = MilitaryInventoryHelper.addUnits(
        updatedAttackerMilitary,
        "AIR_FORCE",
        calcResult.capturedAirForce,
        defender.military.techLevel,
      );
    }
    if (calcResult.capturedDrones > 0) {
      updatedAttackerMilitary = MilitaryInventoryHelper.addUnits(
        updatedAttackerMilitary,
        "DRONE_MISSILE",
        calcResult.capturedDrones,
        defender.military.techLevel,
      );
    }
    if (calcResult.capturedNavalFleet > 0) {
      updatedAttackerMilitary = MilitaryInventoryHelper.addUnits(
        updatedAttackerMilitary,
        "NAVAL_FLEET",
        calcResult.capturedNavalFleet,
        defender.military.techLevel,
      );
    }

    const newAttackerMaxCap =
      (attacker.maxPopulationCapacity ||
        Math.floor(attacker.population / 0.95)) + transferredCapacity;

    let updatedAttacker = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...attacker,
        maxPopulationCapacity: newAttackerMaxCap,
        geography: {
          ...attacker.geography,
          territoryPixelCount: attackerTotalPixels,
        },
      },
      attacker.population + transferredPopulation,
    );

    let baseWarReputationPenalty = currentStance !== "WAR" ? 10 : 0;
    if (calcResult.isFullCapitulation) {
      baseWarReputationPenalty += 15;
    }

    let totalRepPenalty = baseWarReputationPenalty;
    if (betrayalResult.hasBetrayed) {
      totalRepPenalty += betrayalResult.reputationPenalty;
    }

    updatedAttacker = {
      ...updatedAttacker,
      globalReputation: Math.max(
        -100,
        attacker.globalReputation - totalRepPenalty,
      ),
      provinceIds: attackerProvIds,
      treasury:
        attacker.treasury -
        calcResult.deploymentMoneyCost +
        calcResult.treasuryLooted,
      military: {
        ...updatedAttackerMilitary,
        experience: Math.min(100, attacker.military.experience + 5),
      },
    };

    const attackerRelKey = updatedAttacker.relations[defender.id]
      ? defender.id
      : canonicalDefenderId;
    if (updatedAttacker.relations[attackerRelKey]) {
      updatedAttacker.relations = {
        ...updatedAttacker.relations,
        [attackerRelKey]: {
          ...updatedAttacker.relations[attackerRelKey]!,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: -100,
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

    let updatedDefenderMilitary = MilitaryInventoryHelper.applyCasualties(
      defender.military,
      calcResult.defenderCasualties.infantryLost,
      calcResult.defenderCasualties.armorLost,
      calcResult.defenderCasualties.airDefenseLost,
      calcResult.defenderCasualties.airForceLost,
      0,
      calcResult.defenderCasualties.navalFleetLost,
    );

    if (!isDefenderAlive) {
      updatedDefenderMilitary = {
        infantry: 0,
        armor: 0,
        airDefense: 0,
        airForce: 0,
        droneMissile: 0,
        navalFleet: 0,
        experience: 0,
        techLevel: defender.military.techLevel,
        inventory: {},
      };
    }

    let updatedDefender = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...defender,
        maxPopulationCapacity: newDefenderCap,
        geography: {
          ...defender.geography,
          territoryPixelCount: defenderRemainingPixels,
        },
      },
      newDefenderPop,
    );

    updatedDefender = {
      ...updatedDefender,
      isAlive: isDefenderAlive,
      provinceIds: defenderProvIds,
      treasury: isDefenderAlive
        ? Math.max(0, defender.treasury - calcResult.treasuryLooted)
        : 0,
      military: updatedDefenderMilitary,
    };

    const defenderRelKey = updatedDefender.relations[attacker.id]
      ? attacker.id
      : canonicalAttackerId;
    if (updatedDefender.relations[defenderRelKey]) {
      updatedDefender.relations = {
        ...updatedDefender.relations,
        [defenderRelKey]: {
          ...updatedDefender.relations[defenderRelKey]!,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: -100,
        },
      };
    }

    const baseNations = {
      ...state.nations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const intervention =
      AllianceInterventionEvaluator.evaluateAllianceInterventions(
        updatedAttacker,
        updatedDefender,
        baseNations,
      );

    const betrayalText = betrayalResult.hasBetrayed
      ? ` [جریمه نقض معاهده: -${betrayalResult.reputationPenalty} اعتبار جهانی]`
      : "";

    const { logEntry } = BattleDiplomacyHelper.buildBattleReportAndLog(
      state,
      updatedAttacker,
      updatedDefender,
      calcResult,
      calcResult.isFullCapitulation,
      betrayalText,
    );

    const additionalLogs: TurnLogEntry[] = [];

    for (const allyId of intervention.interveningAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        additionalLogs.push({
          id: `log-ally-war-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: state.currentTurn,
          timestamp: Date.now(),
          sourceNationId: ally.id,
          level: "CRITICAL",
          message: `دفاع جمعی متحدین: کشور ${ally.name} در راستای اجرای تعهدات اتحاد نظامی با ${defender.name}، به ارتش ${attacker.name} اعلان جنگ رسمی نمود.`,
        });
      }
    }

    for (const allyId of intervention.dishonoringAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        additionalLogs.push({
          id: `log-ally-dishonor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: state.currentTurn,
          timestamp: Date.now(),
          sourceNationId: ally.id,
          level: "WARNING",
          message: `پیمان‌شکنی دفاعی: کشور ${ally.name} از ترس رویارویی با ارتش ${attacker.name}، اتحاد خود با ${defender.name} را لغو کرد و بی‌طرف ماند.`,
        });
      }
    }

    const rankedNations = RankManager.recalculateRanks(
      intervention.updatedNations,
    );

    const newState: GameState = {
      ...state,
      provinces: updatedProvinces,
      nations: rankedNations,
      turnLogs: [...state.turnLogs, logEntry, ...additionalLogs],
    };

    if (newState.turnLogs.length > 200) {
      newState.turnLogs.splice(0, newState.turnLogs.length - 200);
    }

    return newState;
  }
}
