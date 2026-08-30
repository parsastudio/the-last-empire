import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleLogFactory } from "@/engine/combat/logging/battle-log-factory";
import { BattleStateMutator } from "@/engine/combat/execution/battle-state-mutator";
import { BattleSpoilsCollector } from "@/engine/combat/execution/battle-spoils-collector";
import { NationAnnexationExecutor } from "@/engine/combat/conquest/nation-annexation-executor";
import {
  CountryRegistry,
  GameError,
  NationGettersUtility,
} from "@geopolitics/domain";

export interface BattleEngineExecutionResult {
  state: GameState;
  reportData: BattleFullReportData;
}

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): BattleEngineExecutionResult {
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

    if (!attacker || !defender) {
      throw new GameError(
        "NATION_NOT_FOUND",
        "طرفین درگیری در سامانه یافت نشدند.",
      );
    }

    const guarantorNation = defender.securityGuarantorId
      ? NationGettersUtility.resolveNation(
          defender.securityGuarantorId,
          state.nations,
        )
      : null;

    const calculationResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.infantryToDeploy,
      action.armorToDeploy,
      action.airForceToDeploy,
      state.provinces,
      guarantorNation,
    );

    const conquestResult = ProvinceConquestHandler.handleConquest(
      state.provinces,
      attacker.id,
      defender.id,
      calculationResult.isAttackerVictory,
      action.targetProvinceId,
    );

    const isDefenderAnnexed =
      calculationResult.isAttackerVictory &&
      conquestResult.remainingDefenderProvinces.length === 0;

    const spoilsData = BattleSpoilsCollector.collectSpoils(
      conquestResult,
      calculationResult.treasuryLooted,
      calculationResult.defenderCasualties,
    );

    const attackType = action.attackType || "LAND";
    const targetProvince = action.targetProvinceId
      ? state.provinces[action.targetProvinceId.toString()]
      : conquestResult.conqueredProvincesList[0] || null;

    const battleLogs = BattleLogFactory.createBattleLogs(
      state.currentTurn,
      attacker,
      defender,
      calculationResult,
      "",
      state.humanNationId,
      isDefenderAnnexed,
      targetProvince,
      attackType,
      spoilsData,
    );

    let updatedProvinces = conquestResult.updatedProvinces;
    let updatedNations = BattleStateMutator.mutateAfterBattle(
      state.nations,
      attacker,
      defender,
      calculationResult,
      spoilsData,
      isDefenderAnnexed,
      calculationResult.auxiliaryGuarantor,
      state.currentTurn,
    );

    if (isDefenderAnnexed) {
      const annexationResult = NationAnnexationExecutor.executeTotalAnnexation(
        updatedProvinces,
        updatedNations,
        attacker.id,
        defender.id,
      );
      updatedProvinces = annexationResult.updatedProvinces;
      updatedNations = annexationResult.updatedNations;
    }

    const updatedAttackedList = [
      ...(updatedNations[attacker.id]?.attackedTargetIdsThisTurn || []),
      canonicalDefenderId,
    ];

    if (updatedNations[attacker.id]) {
      updatedNations[attacker.id] = {
        ...updatedNations[attacker.id]!,
        attackedTargetIdsThisTurn: updatedAttackedList,
      };
    }

    const nextState: GameState = {
      ...state,
      provinces: updatedProvinces,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, ...battleLogs],
    };

    const reportData = BattleLogFactory.assembleReportData(
      attacker,
      defender,
      calculationResult,
      targetProvince,
      attackType,
      isDefenderAnnexed,
      spoilsData,
    );

    return {
      state: nextState,
      reportData,
    };
  }
}
