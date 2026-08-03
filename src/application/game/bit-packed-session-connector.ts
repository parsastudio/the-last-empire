import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedTurnOrchestrator } from "@/engine/orchestrator/final/bit-packed-turn-orchestrator";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class BitPackedSessionConnector {
  private orchestrator = new BitPackedTurnOrchestrator();

  public advanceSessionTurn(currentState: GameState): GameState {
    const gridState = BitPackedGridState.getInstance();
    gridState.clearModifiedIndices();

    return this.orchestrator.processPostTurn(currentState);
  }
}
