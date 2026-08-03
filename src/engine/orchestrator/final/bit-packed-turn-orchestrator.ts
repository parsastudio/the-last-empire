import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { FrontierBitManager } from "@/engine/combat/final/frontier-bit-manager";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class BitPackedTurnOrchestrator {
  private facade = new BitPackedStateFacade();
  private frontierManager = new FrontierBitManager();

  public processPostTurn(state: GameState): GameState {
    const gridState = BitPackedGridState.getInstance();
    const buffer = gridState.getBuffer();

    this.frontierManager.updateAllFrontiers(buffer);
    const updatedState = this.facade.syncGameState(state);

    return {
      ...updatedState,
      currentTurn: updatedState.currentTurn + 1,
    };
  }
}
