import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "./battle-calculator";
import { BattleDiplomacyHelper } from "./battle-diplomacy-helper";

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

    const currentRelation =
      attacker.relations[defender.id] ||
      attacker.relations[canonicalDefenderId];
    const currentStance = currentRelation
      ? currentRelation.stance
      : "NORMAL_DIPLOMACY";

    const betrayalResult =
      BattleDiplomacyHelper.evaluateBetrayalPenalty(currentStance);

    const oilPrice = state.marketPrices?.oil || 25000000;

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      oilPrice,
      action.infantryToDeploy,
      action.airForceToDeploy,
      action.targetEnclaveId,
    );

    const updatedProvinces = { ...state.provinces };
    let conqueredProvince: Province | null = null;

    if (calcResult.isAttackerVictory) {
      const defenderProvinceList = Object.values(updatedProvinces).filter(
        (p) =>
          p.ownerNationId === defender.id ||
          p.ownerNationId === canonicalDefenderId,
      );

      if (
        action.targetProvinceId &&
        updatedProvinces[action.targetProvinceId.toString()]
      ) {
        conqueredProvince =
          updatedProvinces[action.targetProvinceId.toString()]!;
      } else if (defenderProvinceList.length > 0) {
        conqueredProvince = defenderProvinceList.sort(
          (a, b) => b.gdp - a.gdp,
        )[0]!;
      }

      if (conqueredProvince) {
        updatedProvinces[conqueredProvince.provinceId.toString()] = {
          ...conqueredProvince,
          ownerNationId: attacker.id,
        };
      }
    }

    const conqueredPixels = conqueredProvince
      ? conqueredProvince.pixelCount
      : 0;

    const remainingDefenderProvinces = Object.values(updatedProvinces).filter(
      (p) =>
        p.ownerNationId === defender.id ||
        p.ownerNationId === canonicalDefenderId,
    );

    const isDefenderAlive = remainingDefenderProvinces.length > 0;
    const isFullCapitulation = !isDefenderAlive;

    const attackerTreasuryAfterDeployment =
      attacker.treasury - calcResult.deploymentMoneyCost;
    const attackerOilAfterDeployment = Math.max(
      0,
      attacker.resources.oil - calcResult.deploymentOilCost,
    );

    let updatedAttacker = {
      ...attacker,
      treasury: attackerTreasuryAfterDeployment + calcResult.treasuryLooted,
      resources: {
        ...attacker.resources,
        oil: attackerOilAfterDeployment,
      },
      military: {
        ...attacker.military,
        infantry: Math.max(
          0,
          attacker.military.infantry -
            calcResult.attackerCasualties.infantryLost,
        ),
        airForce: Math.max(
          0,
          attacker.military.airForce -
            calcResult.attackerCasualties.airForceLost,
        ),
        droneMissile: Math.max(
          0,
          attacker.military.droneMissile - calcResult.dronesUsed,
        ),
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

    const updatedDefender = {
      ...defender,
      isAlive: isDefenderAlive,
      treasury: Math.max(0, defender.treasury - calcResult.treasuryLooted),
      military: {
        ...defender.military,
        infantry: isDefenderAlive
          ? Math.max(
              0,
              defender.military.infantry -
                calcResult.defenderCasualties.infantryLost,
            )
          : 0,
        airForce: isDefenderAlive
          ? Math.max(
              0,
              defender.military.airForce -
                calcResult.defenderCasualties.airForceLost,
            )
          : 0,
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

    const newState = {
      ...state,
      provinces: updatedProvinces,
      nations: tempNations,
      turnLogs: [...state.turnLogs, logEntry],
    };

    if (newState.turnLogs.length > 200) {
      newState.turnLogs.splice(0, newState.turnLogs.length - 200);
    }

    return newState;
  }
}
