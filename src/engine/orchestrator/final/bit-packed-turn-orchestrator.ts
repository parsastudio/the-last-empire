import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class BitPackedTurnOrchestrator {
  public processPostTurn(state: GameState): GameState {
    const gridState = BitPackedGridState.getInstance();

    if (gridState.getModifiedIndices().size > 0) {
      gridState.clearModifiedIndices();
    }

    return state;
  }
}
