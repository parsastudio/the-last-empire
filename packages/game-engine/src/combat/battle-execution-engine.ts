import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomacy-engine";
import {
  NationRelationResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleLogFactory } from "@/engine/combat/logging/battle-log-factory";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { BattleSpoilsCollector } from "@/engine/combat/execution/battle-spoils-collector";
import { BattleStateMutator } from "@/engine/combat/execution/battle-state-mutator";

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): { state: GameState; reportData: BattleFullReportData | null } {
    const attacker = NationGettersUtility.resolveNation(
      action.nationId,
      state.nations,
    );
    const defender = NationGettersUtility.resolveNation(
      action.targetNationId,
      state.nations,
    );

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return { state, reportData: null };
    }

    const currentStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );
    const betrayalResult =
      DiplomaticBetrayalCalculator.calculatePenalty(currentStance);

    const guarantorNation = defender.securityGuarantorId
      ? NationGettersUtility.resolveNation(
          defender.securityGuarantorId,
          state.nations,
        )
      : null;

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      action.infantryToDeploy,
      action.armorToDeploy || 0,
      action.airForceToDeploy,
      state.provinces,
      guarantorNation,
    );

    const conquest = ProvinceConquestHandler.handleConquest(
      state.provinces,
      attacker.id,
      defender.id,
      calcResult.isAttackerVictory,
      action.targetProvinceId,
    );

    const isDefenderAlive = conquest.remainingDefenderProvinces.length > 0;
    const isTotalAnnexation = calcResult.isAttackerVictory && !isDefenderAlive;

    const spoilsResult = BattleSpoilsCollector.collect(
      defender,
      calcResult,
      conquest,
      isTotalAnnexation,
    );

    const mutationResult = BattleStateMutator.mutate(
      state.nations,
      attacker,
      defender,
      guarantorNation,
      calcResult,
      conquest,
      currentStance,
      betrayalResult,
      isDefenderAlive,
      state.currentTurn,
      spoilsResult.extraCapturedUnits,
      spoilsResult.extraTreasuryLooted,
    );

    const betrayalText = betrayalResult.hasBetrayed ? "BETRAYAL" : "";
    const targetProvinceObj = action.targetProvinceId
      ? state.provinces[action.targetProvinceId.toString()] || null
      : null;
    const attackType = action.attackType || "LAND";

    const fullReportData = BattleLogFactory.assembleReportData(
      attacker,
      defender,
      calcResult,
      targetProvinceObj,
      attackType,
      !isDefenderAlive,
      spoilsResult.spoilsData,
    );

    const battleLogs = BattleLogFactory.createBattleLogs(
      state.currentTurn,
      mutationResult.updatedAttacker,
      mutationResult.updatedDefender,
      calcResult,
      betrayalText,
      state.humanNationId,
      !isDefenderAlive,
      targetProvinceObj,
      attackType,
      spoilsResult.spoilsData,
    );

    const updatedLogs = [
      ...state.turnLogs,
      ...battleLogs,
      ...mutationResult.guarantorLogs,
    ];

    if (conquest.conqueredProvincesList.length > 0) {
      BitPackedGridState.getInstance().markDirty();
    }

    const nextState: GameState = {
      ...state,
      provinces: conquest.updatedProvinces,
      nations: mutationResult.updatedNations,
      turnLogs: updatedLogs,
    };

    return { state: nextState, reportData: fullReportData };
  }
}
