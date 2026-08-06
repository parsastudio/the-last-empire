import { GameState } from "@/domain/game/game-state.schema";
import { FrontierBitManager } from "@/engine/combat/final/frontier-bit-manager";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class BitPackedTurnOrchestrator {
  private frontierManager = new FrontierBitManager();

  public processPostTurn(state: GameState): GameState {
    const gridState = BitPackedGridState.getInstance();
    const buffer = gridState.getBuffer();

    if (gridState.getModifiedIndices().size > 0) {
      this.frontierManager.updateModifiedFrontiers(
        buffer,
        gridState.getModifiedIndices(),
      );
      gridState.clearModifiedIndices();
    }

    return state;
  }
}
