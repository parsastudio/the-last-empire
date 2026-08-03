import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedTurnOrchestrator } from "@/engine/orchestrator/final/bit-packed-turn-orchestrator";

export class GridPostTurnCleanup {
  private turnOrchestrator = new BitPackedTurnOrchestrator();

  public cleanupAndSynchronize(state: GameState): GameState {
    return this.turnOrchestrator.processPostTurn(state);
  }
}
