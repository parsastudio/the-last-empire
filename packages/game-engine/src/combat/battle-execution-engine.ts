import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { Province } from "@/domain/province/province.schema";
import {
  BattleCalculator,
  BattleCalculationResult,
} from "@/engine/combat/battle-calculator";
import { BattleStateMutator } from "@/engine/combat/execution/battle-state-mutator";
import { BattleSpoilsCollector } from "@/engine/combat/execution/battle-spoils-collector";
import { ProvinceConquestHandler } from "@/engine/combat/conquest/province-conquest-handler";
import { NationAnnexationExecutor } from "@/engine/combat/conquest/nation-annexation-executor";
import { BattleLogFactory } from "@/engine/combat/logging/battle-log-factory";
import { CountryRegistry } from "@/domain/data/countries";
import {
  NationGettersUtility,
  NationRelationResolver,
  IndustryCalculator,
} from "@geopolitics/domain";

export interface BattleExecutionResult {
  state: GameState;
  reportData: unknown;
}

export class BattleExecutionEngine {
  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): BattleExecutionResult {
    const canonicalAttackerId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefenderId = CountryRegistry.resolveCanonicalId(
      action.targetNationId,
    );

    const attacker =
      state.nations[canonicalAttackerId] || state.nations[action.nationId]!;
    const defender =
      state.nations[canonicalDefenderId] ||
      state.nations[action.targetNationId]!;

    const guarantorNation = defender.securityGuarantorId
      ? NationGettersUtility.resolveNation(
          defender.securityGuarantorId,
          state.nations,
        )
      : null;

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch || 0,
      action.infantryToDeploy,
      action.armorToDeploy,
      action.airForceToDeploy,
      state.provinces,
      guarantorNation,
      action.targetProvinceId,
    );

    let updatedProvinces = { ...state.provinces };
    const factoriesToDestroy = calcResult.phase1Missile.destroyedFactories;
    let actualDestroyedFactories = 0;

    if (factoriesToDestroy > 0) {
      const candidateProvinces = Object.values(updatedProvinces).filter((p) => {
        const ownerCanonical = CountryRegistry.resolveCanonicalId(
          p.ownerNationId,
        );
        const isTargetDefender = ownerCanonical === canonicalDefenderId;
        const isNotTargetIfAttackerWon =
          calcResult.isAttackerVictory && action.targetProvinceId
            ? p.provinceId !== action.targetProvinceId
            : true;
        return (
          isTargetDefender && isNotTargetIfAttackerWon && p.factoriesCount > 0
        );
      });

      const destructionResult = IndustryCalculator.distributeFactoryDestruction(
        updatedProvinces,
        candidateProvinces,
        factoriesToDestroy,
      );

      updatedProvinces = destructionResult.updatedProvinces;
      actualDestroyedFactories = destructionResult.actualDestroyed;
    }

    const conquestResult = ProvinceConquestHandler.handleConquest(
      updatedProvinces,
      attacker.id,
      defender.id,
      calcResult.isAttackerVictory,
      action.targetProvinceId,
    );

    updatedProvinces = conquestResult.updatedProvinces;
    const isDefenderAnnexed =
      calcResult.isAttackerVictory &&
      conquestResult.remainingDefenderProvinces.length === 0;

    const spoilsData = BattleSpoilsCollector.collectSpoils(
      conquestResult,
      defender,
      calcResult,
    );

    let updatedNations = BattleStateMutator.mutate(
      state.nations,
      attacker,
      defender,
      calcResult,
      spoilsData,
      isDefenderAnnexed,
      conquestResult.conqueredFactoriesCount,
      conquestResult.originalFactoriesCount,
      actualDestroyedFactories,
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

    const targetProvince = action.targetProvinceId
      ? state.provinces[action.targetProvinceId.toString()]
      : null;

    const attackType = action.attackType || "LAND";

    const prevStance = NationRelationResolver.getStance(
      attacker.relations,
      defender.id,
    );
    let betrayalPenalty = 0;
    if (prevStance === "STRATEGIC_PARTNERSHIP") {
      betrayalPenalty = 40;
    } else if (prevStance === "NON_AGGRESSION_PACT") {
      betrayalPenalty = 25;
    } else if (prevStance === "NORMAL_DIPLOMACY") {
      betrayalPenalty = 15;
    }

    const betrayalPenaltyText = betrayalPenalty > 0 ? `${betrayalPenalty}` : "";

    const battleLogs = BattleLogFactory.createBattleLogs(
      state.currentTurn,
      attacker,
      defender,
      calcResult,
      betrayalPenaltyText,
      state.humanNationId,
      isDefenderAnnexed,
      targetProvince,
      attackType,
      spoilsData,
    );

    const reportData = BattleLogFactory.assembleReportData(
      attacker,
      defender,
      calcResult,
      targetProvince,
      attackType,
      isDefenderAnnexed,
      spoilsData,
    );

    return {
      state: {
        ...state,
        provinces: updatedProvinces,
        nations: updatedNations,
        turnLogs: [...state.turnLogs, ...battleLogs],
      },
      reportData,
    };
  }
}
