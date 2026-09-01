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
} from "@geopolitics/domain";

export interface BattleExecutionResult {
  state: GameState;
  reportData: unknown;
}

export class BattleExecutionEngine {
  private static distributeFactoryDestruction(
    provincesMap: Record<string, Province>,
    candidateProvinces: Province[],
    factoriesToDestroy: number,
  ): Record<string, Province> {
    if (factoriesToDestroy <= 0 || candidateProvinces.length === 0) {
      return provincesMap;
    }

    const updatedProvinces = { ...provincesMap };
    let totalPoolFactories = 0;

    for (let i = 0; i < candidateProvinces.length; i++) {
      totalPoolFactories += candidateProvinces[i]!.factoriesCount;
    }

    if (totalPoolFactories <= 0) {
      return provincesMap;
    }

    const minProtectedFloor = Math.max(1, Math.ceil(totalPoolFactories * 0.05));
    const maxDestroyable = Math.max(0, totalPoolFactories - minProtectedFloor);
    const actualDestroyCount = Math.min(factoriesToDestroy, maxDestroyable);

    if (actualDestroyCount <= 0) {
      return provincesMap;
    }

    let remainingToDeduct = actualDestroyCount;
    const sortedProvinces = [...candidateProvinces].sort(
      (a, b) => b.factoriesCount - a.factoriesCount,
    );

    for (let i = 0; i < sortedProvinces.length && remainingToDeduct > 0; i++) {
      const p = sortedProvinces[i]!;
      const currentCount = p.factoriesCount;
      if (currentCount <= 0) continue;

      const proportionalShare = Math.floor(
        (currentCount / totalPoolFactories) * actualDestroyCount,
      );
      const deduct = Math.max(
        1,
        Math.min(currentCount, Math.min(remainingToDeduct, proportionalShare)),
      );

      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        factoriesCount: currentCount - deduct,
      };

      remainingToDeduct -= deduct;
    }

    let loopIndex = 0;
    while (remainingToDeduct > 0 && loopIndex < sortedProvinces.length) {
      const p = sortedProvinces[loopIndex]!;
      const current = updatedProvinces[p.provinceId.toString()]!;
      if (current.factoriesCount > 0) {
        updatedProvinces[p.provinceId.toString()] = {
          ...current,
          factoriesCount: current.factoriesCount - 1,
        };
        remainingToDeduct--;
      }
      loopIndex++;
    }

    return updatedProvinces;
  }

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

    if (factoriesToDestroy > 0) {
      if (calcResult.isAttackerVictory) {
        const defenderOtherProvinces = Object.values(updatedProvinces).filter(
          (p) => {
            const ownerCanonical = CountryRegistry.resolveCanonicalId(
              p.ownerNationId,
            );
            return (
              ownerCanonical === canonicalDefenderId &&
              p.provinceId !== action.targetProvinceId &&
              p.factoriesCount > 0
            );
          },
        );

        updatedProvinces = BattleExecutionEngine.distributeFactoryDestruction(
          updatedProvinces,
          defenderOtherProvinces,
          factoriesToDestroy,
        );
      } else {
        const defenderAllProvinces = Object.values(updatedProvinces).filter(
          (p) => {
            const ownerCanonical = CountryRegistry.resolveCanonicalId(
              p.ownerNationId,
            );
            return (
              ownerCanonical === canonicalDefenderId && p.factoriesCount > 0
            );
          },
        );

        updatedProvinces = BattleExecutionEngine.distributeFactoryDestruction(
          updatedProvinces,
          defenderAllProvinces,
          factoriesToDestroy,
        );
      }
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
