import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { AIEngine } from "@/engine/ai/ai-engine";
import { ActionQueue } from "./action-queue";
import { TurnPipeline } from "@/engine/turn-pipeline";
import { GridPostTurnCleanup } from "./grid-post-turn-cleanup";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/seeded-random";

export class TurnProgressionOrchestrator {
  private aiEngine = new AIEngine();
  private internalActionQueue = new ActionQueue();
  private pipeline = new TurnPipeline();
  private gridPostCleanup = new GridPostTurnCleanup();
  private livenessManager = new NationLivenessManager();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(
    state: GameState,
    gridState: GridState,
    prng: SeededRandom,
    actionQueueProcessor: (
      state: GameState,
      additionalActions?: readonly GameAction[],
    ) => GameState,
  ): GameState {
    let nextState = state;

    const stateWithGrid = { ...nextState, gridState } as unknown as GameState;
    const aiActions = this.aiEngine.generateTurnActions(stateWithGrid);
    for (const aiAction of aiActions) {
      try {
        this.internalActionQueue.enqueue(stateWithGrid, aiAction);
      } catch {
        continue;
      }
    }

    const validAiActions = this.internalActionQueue.getQueue();
    this.internalActionQueue.clear();

    nextState = actionQueueProcessor(nextState, validAiActions);
    nextState = this.pipeline.processTurn(nextState, prng);
    nextState = this.gridPostCleanup.cleanupAndSynchronize(
      nextState,
      gridState,
    );
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
