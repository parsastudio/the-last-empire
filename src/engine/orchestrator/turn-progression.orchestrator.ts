import { GameState } from "@/domain/game/game-state.schema";
import { AIEngine } from "@/engine/ai/ai-engine";
import { ActionQueue } from "@/engine/orchestrator/action-queue";
import { ActionPrioritySorter } from "@/engine/orchestrator/action-priority-sorter";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { BitPackedTurnOrchestrator } from "@/engine/orchestrator/final/bit-packed-turn-orchestrator";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { ActionEngine } from "@/engine/actions/action-engine";

export class TurnProgressionOrchestrator {
  private aiEngine = new AIEngine();
  private actionQueue = new ActionQueue();
  private prioritySorter = new ActionPrioritySorter();
  private pipeline = new TurnPipeline();
  private turnOrchestrator = new BitPackedTurnOrchestrator();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(state: GameState, prng: SeededRandom): GameState {
    console.time("orchestrator-advanceTurn-total");
    console.log("[orchestrator] Starting turn advancement");
    let nextState = state;

    console.time("aiActions");
    const aiActions = this.aiEngine.generateTurnActions(nextState);
    console.timeEnd("aiActions");
    console.log(`[orchestrator] Generated ${aiActions.length} AI actions`);

    console.time("queue-ai-actions");
    for (const aiAction of aiActions) {
      try {
        this.actionQueue.enqueue(nextState, aiAction);
      } catch {}
    }
    const queuedActions = this.actionQueue.getQueue();
    this.actionQueue.clear();
    console.timeEnd("queue-ai-actions");

    console.time("sort-actions");
    const sortedActions = this.prioritySorter.sortActions(queuedActions, prng);
    console.timeEnd("sort-actions");

    console.time("execute-actions");
    for (const action of sortedActions) {
      const result = ActionEngine.execute(nextState, action);
      if (result.success && result.newState) {
        nextState = result.newState;
        const logEntry = TurnLogBuilder.createLogEntry(
          nextState.currentTurn,
          action.nationId,
          "INFO",
          `پردازش اکشن هوش مصنوعی: ${action.type}`,
        );
        const updatedLogs = [...nextState.turnLogs, logEntry];
        if (updatedLogs.length > 200) {
          updatedLogs.splice(0, updatedLogs.length - 200);
        }
        nextState = {
          ...nextState,
          turnLogs: updatedLogs,
        };
      }
    }
    console.timeEnd("execute-actions");

    console.time("pipeline");
    nextState = this.pipeline.processTurn(nextState, prng);
    console.timeEnd("pipeline");

    console.time("post-turn");
    nextState = this.turnOrchestrator.processPostTurn(nextState);
    console.timeEnd("post-turn");

    console.time("liveness");
    nextState = this.livenessManager.updateLiveness(nextState);
    console.timeEnd("liveness");

    const peacefulCount = (nextState.peacefulTurnsCount ?? 0) + 1;
    nextState = {
      ...nextState,
      peacefulTurnsCount: peacefulCount,
    };

    console.time("victory-check");
    const victoryStatus = this.victoryChecker.checkVictory(nextState);
    console.timeEnd("victory-check");
    if (victoryStatus.isGameOver) {
      nextState = {
        ...nextState,
        isGameOver: true,
        winnerNationId: victoryStatus.winnerNationId,
      };
    }

    nextState = {
      ...nextState,
      currentTurn: nextState.currentTurn + 1,
      seed: prng.getSeed(),
    };

    console.timeEnd("orchestrator-advanceTurn-total");
    return nextState;
  }
}
