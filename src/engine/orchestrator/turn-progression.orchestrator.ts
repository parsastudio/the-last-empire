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
    let nextState = state;

    const aiActions = this.aiEngine.generateTurnActions(nextState);

    for (const aiAction of aiActions) {
      try {
        this.actionQueue.enqueue(nextState, aiAction);
      } catch {}
    }
    const queuedActions = this.actionQueue.getQueue();
    this.actionQueue.clear();

    const sortedActions = this.prioritySorter.sortActions(queuedActions, prng);

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

    nextState = this.pipeline.processTurn(nextState, prng);
    nextState = this.turnOrchestrator.processPostTurn(nextState);
    nextState = this.livenessManager.updateLiveness(nextState);

    const peacefulCount = (nextState.peacefulTurnsCount ?? 0) + 1;
    nextState = {
      ...nextState,
      peacefulTurnsCount: peacefulCount,
    };

    const victoryStatus = this.victoryChecker.checkVictory(nextState);
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

    return nextState;
  }
}
