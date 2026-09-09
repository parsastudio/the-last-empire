import { GameState } from "@/domain/game/game-state.schema";
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

export class TurnProgressionOrchestrator {
  private pipeline = new TurnPipeline();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    const lockedDiplomacyTargets = new Set<string>();
    const nextTurn = state.currentTurn + 1;

    let workingState: GameState = {
      ...state,
      currentTurn: nextTurn,
      provinces: { ...state.provinces },
      nations: { ...state.nations },
      turnLogs: [...state.turnLogs],
      pendingProposals: [...state.pendingProposals],
      turnActivity: {},
    };

    const turnContext = TurnContext.create(workingState);

    workingState = this.pipeline.processTurn(workingState, turnContext);
    workingState = this.livenessManager.updateLiveness(workingState);

    turnContext.sync(workingState);

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
        workingState.nations,
        workingState.provinces,
        lockedDiplomacyTargets,
        turnContext.matrixCache,
        workingState.globalCoalition,
        workingState.currentTurn,
        turnContext,
        workingState.turnActivity?.[currentNation.id],
      );

      if (aiActions.length > 0) {
        const { newState: executedState, executedCount } =
          ActionEngine.executeBatch(
            workingState,
            aiActions,
            lockedDiplomacyTargets,
          );

        if (executedCount > 0) {
          const hasTerritorialChange =
            TurnContext.hasTerritorialOwnershipChange(
              workingState,
              executedState,
            );

          workingState = executedState;

          if (hasTerritorialChange) {
            turnContext.sync(workingState);
          }
        }
      }
    }

    workingState = TurnExportSalesAggregator.aggregate(workingState);
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

    const prunedLogs = TurnLogWindowUtility.pruneLogs(
      workingState.turnLogs,
      workingState.currentTurn,
    );

    const finalState: GameState = {
      ...workingState,
      turnLogs: prunedLogs,
      seed: prng.getSeed(),
    };

    TurnStateLogger.logTurnState(finalState);

    return finalState;
  }
}
