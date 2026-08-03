import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";

export class StateSynchronizerFacade {
  private facade = new BitPackedStateFacade();

  public syncStateToGrid(state: GameState): GameState {
    return this.facade.syncGameState(state);
  }

  public synchronizeAll(state: GameState): GameState {
    return this.facade.syncGameState(state);
  }
}
