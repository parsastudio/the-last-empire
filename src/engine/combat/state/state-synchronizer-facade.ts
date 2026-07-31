import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { MapStateSynchronizer } from "@/engine/combat/state/map-state-synchronizer";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";

export class StateSynchronizerFacade {
  private mapSynchronizer = new MapStateSynchronizer();
  private gdpPopUpdater = new GdpPopUpdater();

  public synchronizeAll(state: GameState, gridState: GridState): GameState {
    const withGridSync = this.mapSynchronizer.syncStateToGrid(state, gridState);
    const allCells = gridState.getAllCells();

    const updatedNations = this.gdpPopUpdater.syncGlobalStats(
      withGridSync.nations,
      allCells,
    );

    return {
      ...withGridSync,
      nations: updatedNations,
    };
  }
}
