import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { LandNeighborDetector } from "./synchronizer/land-neighbor-detector";
import { TerritoryCalibrator } from "./synchronizer/territory-calibrator";

export class MapStateSynchronizer {
  private neighborDetector = new LandNeighborDetector();
  private territoryCalibrator = new TerritoryCalibrator();

  public syncStateToGrid(state: GameState, gridState: GridState): GameState {
    const t0 = performance.now();
    const nationsKeys = Object.keys(state.nations);

    const tDetectStart = performance.now();
    const neighborResult = this.neighborDetector.detectNeighbors(
      nationsKeys,
      gridState,
    );
    const tDetect = performance.now() - tDetectStart;

    const tCalibStart = performance.now();
    const updatedNations = this.territoryCalibrator.calibrateNationsTerritory(
      state.nations,
      gridState,
      neighborResult.landNeighborsMap,
      neighborResult.seaNeighborsMap,
      neighborResult.oceanAccessMap,
    );
    const tCalib = performance.now() - tCalibStart;

    const totalSync = performance.now() - t0;
    console.log(
      `[MAP STATE SYNC TIMING] Total: ${totalSync.toFixed(2)}ms | DetectNeighbors: ${tDetect.toFixed(2)}ms | CalibrateTerritory: ${tCalib.toFixed(2)}ms`,
    );

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
