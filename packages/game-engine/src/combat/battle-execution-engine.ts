import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
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

        if (defenderOtherProvinces.length > 0) {
          defenderOtherProvinces.sort(
            (a, b) => b.factoriesCount - a.factoriesCount,
          );
          const rearProv = defenderOtherProvinces[0]!;
          const actualDestroyed = Math.min(
            rearProv.factoriesCount,
            factoriesToDestroy,
          );
          updatedProvinces[rearProv.provinceId.toString()] = {
            ...rearProv,
            factoriesCount: rearProv.factoriesCount - actualDestroyed,
          };
        }
      } else if (action.targetProvinceId) {
        const targetProv = updatedProvinces[action.targetProvinceId.toString()];
        if (targetProv && targetProv.factoriesCount > 0) {
          const actualDestroyed = Math.min(
            targetProv.factoriesCount,
            factoriesToDestroy,
          );
          updatedProvinces[action.targetProvinceId.toString()] = {
            ...targetProv,
            factoriesCount: targetProv.factoriesCount - actualDestroyed,
          };
        }
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
