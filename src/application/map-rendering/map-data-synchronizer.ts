import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";

export class MapDataSynchronizer {
  private facade = new StateSynchronizerFacade();

  public synchronizeMapState(
    state: GameState,
    gridState: GridState,
  ): GameState {
    return this.facade.synchronizeAll(state, gridState);
  }
}
