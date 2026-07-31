import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { MapStateSynchronizer } from "@/engine/combat/state/map-state-synchronizer";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";

export class StateSynchronizerFacade {
  private mapSynchronizer = new MapStateSynchronizer();
  private gdpPopUpdater = new GdpPopUpdater();

  public synchronizeAll(state: GameState, gridState: GridState): GameState {
    const t0 = performance.now();
    const withGridSync = this.mapSynchronizer.syncStateToGrid(state, gridState);
    const tMapSync = performance.now() - t0;

    const tGdpStart = performance.now();
    const allCells = gridState.getAllCells();
    const updatedNations = this.gdpPopUpdater.syncGlobalStats(
      withGridSync.nations,
      allCells,
    );
    const tGdpSync = performance.now() - tGdpStart;

    const totalSync = performance.now() - t0;
    console.log(
      `[STATE SYNCHRONIZER TIMING] Total: ${totalSync.toFixed(2)}ms | MapStateSync: ${tMapSync.toFixed(2)}ms | GdpPopSync: ${tGdpSync.toFixed(2)}ms`,
    );

    return {
      ...withGridSync,
      nations: updatedNations,
    };
  }
}
