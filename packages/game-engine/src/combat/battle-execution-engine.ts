import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomacy-engine";
import { RankManager } from "@/engine/politics/rank-manager";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { AllianceInterventionEvaluator } from "@/engine/combat/alliance-intervention-evaluator";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { DemographicsTransferCalculator } from "@/engine/combat/conquest/demographics-transfer-calculator";
import { BattleAttackerStateApplier } from "@/engine/combat/state-appliers/battle-attacker-state-applier";
import { BattleDefenderStateApplier } from "@/engine/combat/state-appliers/battle-defender-state-applier";
import { BattleLogFactory } from "@/engine/combat/logging/battle-log-factory";

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
      state.nations[canonicalAttackerId] || state.nations[action.nationId];
    const defender =
      state.nations[canonicalDefenderId] ||
      state.nations[action.targetNationId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const currentStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );
    const betrayalResult =
      DiplomaticBetrayalCalculator.calculatePenalty(currentStance);

    let navalCostMultiplier: number | undefined = undefined;
    if (action.attackType === "NAVAL" && action.targetProvinceId) {
      const navalInfo = NavalNeighborResolver.resolveNavalAttack(
        action.targetProvinceId,
        attacker.id,
        state.provinces,
        action.infantryToDeploy || attacker.military.infantry,
        action.armorToDeploy || attacker.military.armor || 0,
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
      action.armorToDeploy || 0,
      action.airForceToDeploy,
      action.attackType,
      navalCostMultiplier,
    );

    const conquest = ProvinceConquestHandler.handleConquest(
      state.provinces,
      attacker.id,
      canonicalAttackerId,
      defender.id,
      canonicalDefenderId,
      calcResult.isAttackerVictory,
      calcResult.isFullCapitulation,
      action.targetProvinceId,
      defender.geography.territoryPixelCount || 1,
    );

    const isDefenderAlive =
      conquest.remainingDefenderProvinces.length > 0 &&
      !calcResult.isFullCapitulation;

    const transfer = DemographicsTransferCalculator.calculateTransfer(
      conquest.conqueredProvincesList,
      calcResult.isAttackerVictory,
    );

    const updatedAttacker = BattleAttackerStateApplier.apply({
      attacker,
      defenderId: defender.id,
      canonicalDefenderId,
      defenderTechLevel: defender.military.techLevel,
      calcResult,
      conquest,
      transfer,
      currentStance,
      betrayalResult,
    });

    const updatedDefender = BattleDefenderStateApplier.apply({
      defender,
      attackerId: attacker.id,
      canonicalAttackerId,
      calcResult,
      conquest,
      transfer,
      isDefenderAlive,
    });

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

    const betrayalText = betrayalResult.hasBetrayed ? "BETRAYAL" : "";

    const battleLogs = BattleLogFactory.createBattleLogs(
      state.currentTurn,
      updatedAttacker,
      updatedDefender,
      calcResult,
      betrayalText,
      state.humanNationId,
    );

    const interventionLogs = BattleLogFactory.createInterventionLogs(
      state.currentTurn,
      intervention,
      updatedAttacker,
      updatedDefender,
      state.humanNationId,
    );

    const rankedNations = RankManager.recalculateRanks(
      intervention.updatedNations,
    );

    const updatedLogs = [...state.turnLogs, ...battleLogs, ...interventionLogs];

    return {
      ...state,
      provinces: conquest.updatedProvinces,
      nations: rankedNations,
      turnLogs: updatedLogs,
    };
  }
}
