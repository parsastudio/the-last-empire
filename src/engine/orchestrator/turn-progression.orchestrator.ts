import { GameState } from "@/domain/game/game-state.schema";
import { AIEngine } from "@/engine/ai/ai-engine";
import { ActionQueue } from "@/engine/orchestrator/action-queue";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { BitPackedTurnOrchestrator } from "@/engine/orchestrator/final/bit-packed-turn-orchestrator";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { ActionRouter } from "@/engine/actions/action-router";
import { StateValidator } from "@/engine/validation/state-validator";

export class TurnProgressionOrchestrator {
  private aiEngine = new AIEngine();
  private actionQueue = new ActionQueue();
  private pipeline = new TurnPipeline();
  private turnOrchestrator = new BitPackedTurnOrchestrator();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();
  private router = new ActionRouter();
  private validator = new StateValidator();

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

    for (const action of queuedActions) {
      try {
        this.validator.validateAction(nextState, action);
        nextState = this.router.route(nextState, action);

        const logEntry = TurnLogBuilder.createLogEntry(
          nextState.currentTurn,
          action.nationId,
          "INFO",
          `پردازش اکشن هوش مصنوعی: ${action.type}`,
        );
        nextState = {
          ...nextState,
          turnLogs: [...nextState.turnLogs, logEntry],
        };
      } catch {}
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
