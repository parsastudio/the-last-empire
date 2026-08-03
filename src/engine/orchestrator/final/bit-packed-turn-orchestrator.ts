import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { FrontierBitManager } from "@/engine/combat/final/frontier-bit-manager";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { BitPackedEnclaveClusterer } from "@/engine/combat/final/bit-packed-enclave-clusterer";

export class BitPackedTurnOrchestrator {
  private facade = new BitPackedStateFacade();
  private frontierManager = new FrontierBitManager();
  private enclaveClusterer = new BitPackedEnclaveClusterer();

  public processPostTurn(state: GameState): GameState {
    const gridState = BitPackedGridState.getInstance();
    const buffer = gridState.getBuffer();

    if (gridState.getModifiedIndices().size > 0) {
      this.enclaveClusterer.clusterNationEnclaves(
        buffer,
        buffer.getWidth(),
        buffer.getHeight(),
      );
    }

    this.frontierManager.updateAllFrontiers(buffer);
    const updatedState = this.facade.syncGameState(state);

    return {
      ...updatedState,
      currentTurn: updatedState.currentTurn + 1,
    };
  }
}
