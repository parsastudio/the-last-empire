import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { AIEngine } from "@/engine/ai/ai-engine";
import { ActionQueue } from "@/engine/action-queue";
import { TurnPhaseOrchestrator } from "./turn-phase-orchestrator";
import { GridPostTurnCleanup } from "./grid-post-turn-cleanup";
import { NationLivenessManager } from "@/engine/politics/nation-liveness-manager";
import { PeaceTracker } from "./peace-tracker";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { SeededRandom } from "@/domain/shared/seeded-random";

export class TurnProgressionOrchestrator {
  private aiEngine = new AIEngine();
  private internalActionQueue = new ActionQueue();
  private turnOrchestrator = new TurnPhaseOrchestrator();
  private gridPostCleanup = new GridPostTurnCleanup();
  private livenessManager = new NationLivenessManager();
  private peaceTracker = new PeaceTracker();
  private victoryChecker = new VictoryChecker();

  public advanceTurn(
    state: GameState,
    gridState: GridState,
    prng: SeededRandom,
    actionQueueProcessor: (state: GameState) => GameState,
  ): GameState {
    let nextState = state;

    const stateWithGrid = { ...nextState, gridState };
    const aiActions = this.aiEngine.generateTurnActions(stateWithGrid);
    for (const aiAction of aiActions) {
      try {
        this.internalActionQueue.enqueue(stateWithGrid, aiAction);
      } catch {
        continue;
      }
    }

    const aiQueue = this.internalActionQueue.getQueue();
    const tempQueue = new ActionQueue();
    for (const act of aiQueue) {
      tempQueue.enqueue({ ...nextState, gridState }, act);
    }
    this.internalActionQueue.clear();

    nextState = actionQueueProcessor(nextState);

    nextState = this.turnOrchestrator.executePhases(nextState, prng);
    nextState = this.gridPostCleanup.cleanupAndSynchronize(
      nextState,
      gridState,
    );
    nextState = this.livenessManager.updateLiveness(nextState);

    const peacefulCount = this.peaceTracker.updatePeacefulTurns(nextState);
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
