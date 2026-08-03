import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";
import { LandNeighborDetector } from "@/engine/combat/state/synchronizer/land-neighbor-detector";
import { TerritoryCalibrator } from "@/engine/combat/state/synchronizer/territory-calibrator";

export class StateSynchronizerFacade {
  private gdpPopUpdater = new GdpPopUpdater();
  private neighborDetector = new LandNeighborDetector();
  private territoryCalibrator = new TerritoryCalibrator();

  public syncStateToGrid(state: GameState, gridState: GridState): GameState {
    const nationsKeys = Object.keys(state.nations);

    const neighborResult = this.neighborDetector.detectNeighbors(
      nationsKeys,
      gridState,
    );

    const updatedNations = this.territoryCalibrator.calibrateNationsTerritory(
      state.nations,
      gridState,
      neighborResult.landNeighborsMap,
      neighborResult.seaNeighborsMap,
      neighborResult.oceanAccessMap,
    );

    return {
      ...state,
      nations: updatedNations,
    };
  }

  public synchronizeAll(state: GameState, gridState: GridState): GameState {
    const withGridSync = this.syncStateToGrid(state, gridState);
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
