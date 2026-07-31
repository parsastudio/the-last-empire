import { GameState } from "@/domain/game/game-state.schema";
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
    actionQueueProcessor: (state: GameState) => GameState,
  ): GameState {
    const t0 = performance.now();
    let nextState = state;

    const tAiStart = performance.now();
    const stateWithGrid = { ...nextState, gridState } as unknown as GameState;
    const aiActions = this.aiEngine.generateTurnActions(stateWithGrid);
    for (const aiAction of aiActions) {
      try {
        this.internalActionQueue.enqueue(stateWithGrid, aiAction);
      } catch {
        continue;
      }
    }

    this.internalActionQueue.clear();
    const tAi = performance.now() - tAiStart;

    const tActionProcStart = performance.now();
    nextState = actionQueueProcessor(nextState);
    const tActionProc = performance.now() - tActionProcStart;

    const tPipelineStart = performance.now();
    nextState = this.pipeline.processTurn(nextState, prng);
    const tPipeline = performance.now() - tPipelineStart;

    const tGridCleanupStart = performance.now();
    nextState = this.gridPostCleanup.cleanupAndSynchronize(
      nextState,
      gridState,
    );
    const tGridCleanup = performance.now() - tGridCleanupStart;

    const tLivenessStart = performance.now();
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
    const tLiveness = performance.now() - tLivenessStart;

    const tTotal = performance.now() - t0;
    console.log(
      `[ENGINE ADVANCE-TURN TIMING] Total: ${tTotal.toFixed(2)}ms | AiActions: ${tAi.toFixed(2)}ms | ActionQueueProc: ${tActionProc.toFixed(2)}ms | Pipeline: ${tPipeline.toFixed(2)}ms | GridCleanupAndSync: ${tGridCleanup.toFixed(2)}ms | LivenessAndVictory: ${tLiveness.toFixed(2)}ms`,
    );

    return nextState;
  }
}
