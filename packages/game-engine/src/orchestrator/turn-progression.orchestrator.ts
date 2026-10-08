import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";
import { AIActionBuilder } from "@/engine/ai/ai-action-builder";
import { CoalitionManager } from "@/engine/politics/coalition-manager";
import { TurnStateLogger } from "@/engine/diagnostics/turn-state-logger";
import { TurnExportSalesAggregator } from "@/engine/orchestrator/turn-export-sales-aggregator";
import { TurnLogWindowUtility } from "@geopolitics/domain";
import { DilemmaTurnEvaluator } from "@/engine/events/dilemma-turn-evaluator";
import { TurnContext } from "@/engine/pipeline/turn-context";

export interface TurnProgressionOutput {
  newState: GameState;
  newTurnLogs: TurnLogEntry[];
}

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurnWithLogs(
    state: GameState,
    prng: SeededRandom,
  ): TurnProgressionOutput {
    const lockedDiplomacyTargets = new Set<string>();
    const nextTurn = state.currentTurn + 1;
    const initialLogsCount = state.turnLogs.length;

    const workingProvinces: typeof state.provinces = {};
    for (const key in state.provinces) {
      const p = state.provinces[key]!;
      workingProvinces[key] = {
        ...p,
        factoryTiers: p.factoryTiers ? p.factoryTiers.map((t) => ({ ...t })) : [],
      };
    }

    const workingNations: typeof state.nations = {};
    for (const key in state.nations) {
      const n = state.nations[key]!;
      workingNations[key] = {
        ...n,
        government: { ...n.government },
        military: {
          ...n.military,
          branchTech: n.military.branchTech ? { ...n.military.branchTech } : undefined,
        },
        factoryTiers: n.factoryTiers ? n.factoryTiers.map((t) => ({ ...t })) : [],
        relations: { ...n.relations },
        activeModifiers: n.activeModifiers ? n.activeModifiers.map((m) => ({ ...m })) : [],
      };
    }

    let workingState: GameState = {
      ...state,
      currentTurn: nextTurn,
      provinces: workingProvinces,
      nations: workingNations,
      turnLogs: [...state.turnLogs],
      pendingProposals: state.pendingProposals.map((p) => ({ ...p })),
      turnActivity: {},
    };

    let turnContext = TurnContext.create(workingState, lockedDiplomacyTargets);

    workingState = this.pipeline.processTurn(workingState, turnContext);
    workingState = this.livenessManager.updateLiveness(workingState);

    turnContext = TurnContext.create(workingState, lockedDiplomacyTargets);

    workingState = CoalitionManager.evaluateCoalitionState(
      workingState,
      turnContext.rankMap,
      turnContext.provincesByOwnerMap,
    );

    const shuffledNationIds = Object.keys(workingState.nations);
    for (let i = shuffledNationIds.length - 1; i > 0; i--) {
      const j = Math.floor(prng.nextFloat() * (i + 1));
      const temp = shuffledNationIds[i]!;
      shuffledNationIds[i] = shuffledNationIds[j]!;
      shuffledNationIds[j] = temp;
    }

    for (let i = 0; i < shuffledNationIds.length; i++) {
      const id = shuffledNationIds[i]!;
      const currentNation = workingState.nations[id];

      if (!currentNation || !currentNation.isAlive || !currentNation.isAi) {
        continue;
      }

      const aiActions = AIActionBuilder.buildNationActions(
        currentNation,
        turnContext,
      );

      if (aiActions.length > 0) {
        const { newState: executedState, executedCount } =
          ActionEngine.executeBatch(
            workingState,
            aiActions,
            lockedDiplomacyTargets,
          );

        if (executedCount > 0) {
          workingState = executedState;
          turnContext = TurnContext.create(
            workingState,
            lockedDiplomacyTargets,
          );
        }
      }
    }

    const aggregationResult = TurnExportSalesAggregator.aggregate(workingState);
    workingState = aggregationResult.state;
    workingState = this.livenessManager.updateLiveness(workingState);
    workingState = DilemmaTurnEvaluator.evaluate(workingState, prng);

    const victoryStatus = this.victoryChecker.checkVictory(workingState);

    if (victoryStatus.isGameOver && !workingState.isGameOver) {
      let winnerId = victoryStatus.winnerNationId;
      if (!winnerId && victoryStatus.reason !== "HUMAN_PLAYER_DEFEATED") {
        winnerId = workingState.humanNationId;
      }

      const victoryLog = TurnLogBuilder.createVictoryLog(
        workingState.currentTurn,
        winnerId || workingState.humanNationId,
        victoryStatus.reason || "WORLD_DOMINANCE",
      );

      workingState = {
        ...workingState,
        isGameOver: true,
        winnerNationId: winnerId,
        gameOverReason: victoryStatus.reason,
        turnLogs: [...workingState.turnLogs, victoryLog],
      };
    }

    const currentNewLogs = workingState.turnLogs.slice(initialLogsCount);

    const prunedLogs = TurnLogWindowUtility.pruneLogs(
      workingState.turnLogs,
      workingState.currentTurn,
      TurnLogWindowUtility.MAX_RETAINED_TURNS,
    );

    const finalState: GameState = {
      ...workingState,
      turnLogs: prunedLogs,
      seed: prng.getSeed(),
    };

    TurnStateLogger.logTurnState(finalState);

    return {
      newState: finalState,
      newTurnLogs: currentNewLogs,
    };
  }
}
