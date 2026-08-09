import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "./battle-calculator";
import { BitPackedStateFacade } from "./final/bit-packed-state-facade";
import { BattleDiplomacyHelper } from "./battle-diplomacy-helper";

export class BattleExecutionEngine {
  private facade = new BitPackedStateFacade();

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

    const defenderPixels = defender.geography.territoryPixelCount;
    const requestedTargetPixels = calcResult.isAttackerVictory
      ? Math.min(calcResult.conqueredPixelsCount, defenderPixels)
      : 0;

    const conquestFacadeResult = this.facade.conquerAndSync(
      state,
      CountryRegistry.resolveNumericId(attacker.id),
      CountryRegistry.resolveNumericId(defender.id),
      requestedTargetPixels,
      attacker.id,
      defender.id,
      action.targetEnclaveId,
    );

    const conqueredPixels = conquestFacadeResult.capturedPixelsCount;
    const syncedNations = conquestFacadeResult.updatedNations;

    const updatedAttackerRef = syncedNations[attacker.id] || attacker;
    const updatedDefenderRef = syncedNations[defender.id] || defender;

    const conquestRatio =
      defenderPixels > 0
        ? Math.min(1.0, conqueredPixels / defenderPixels)
        : 1.0;

    const popTransferred = Math.floor(defender.population * conquestRatio);
    const gdpTransferred = Math.floor(defender.gdp * conquestRatio);

    const isDefenderAlive =
      updatedDefenderRef.geography.territoryPixelCount > 0 &&
      defender.population - popTransferred > 0;

    const isFullCapitulation = !isDefenderAlive;

    const attackerTreasuryAfterDeployment =
      updatedAttackerRef.treasury - calcResult.deploymentMoneyCost;
    const attackerOilAfterDeployment = Math.max(
      0,
      updatedAttackerRef.resources.oil - calcResult.deploymentOilCost,
    );

    let updatedAttacker = {
      ...updatedAttackerRef,
      gdp: updatedAttackerRef.gdp + gdpTransferred,
      population: updatedAttackerRef.population + popTransferred,
      treasury: attackerTreasuryAfterDeployment + calcResult.treasuryLooted,
      resources: {
        ...updatedAttackerRef.resources,
        oil: attackerOilAfterDeployment,
      },
      military: {
        ...updatedAttackerRef.military,
        infantry: Math.max(
          0,
          updatedAttackerRef.military.infantry -
            calcResult.attackerCasualties.infantryLost,
        ),
        airForce: Math.max(
          0,
          updatedAttackerRef.military.airForce -
            calcResult.attackerCasualties.airForceLost,
        ),
        droneMissile: Math.max(
          0,
          updatedAttackerRef.military.droneMissile - calcResult.dronesUsed,
        ),
        experience: Math.min(100, updatedAttackerRef.military.experience + 5),
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
      ...updatedDefenderRef,
      isAlive: isDefenderAlive,
      gdp: isDefenderAlive ? Math.max(0, defender.gdp - gdpTransferred) : 0,
      population: isDefenderAlive
        ? Math.max(0, defender.population - popTransferred)
        : 0,
      treasury: Math.max(0, defender.treasury - calcResult.treasuryLooted),
      military: {
        ...updatedDefenderRef.military,
        infantry: isDefenderAlive
          ? Math.max(
              0,
              updatedDefenderRef.military.infantry -
                calcResult.defenderCasualties.infantryLost,
            )
          : 0,
        airForce: isDefenderAlive
          ? Math.max(
              0,
              updatedDefenderRef.military.airForce -
                calcResult.defenderCasualties.airForceLost,
            )
          : 0,
        experience: Math.min(100, updatedDefenderRef.military.experience + 3),
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
      ...syncedNations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const newState = {
      ...state,
      nations: tempNations,
      turnLogs: [...state.turnLogs, logEntry],
    };

    if (newState.turnLogs.length > 200) {
      newState.turnLogs.splice(0, newState.turnLogs.length - 200);
    }

    return newState;
  }
}
