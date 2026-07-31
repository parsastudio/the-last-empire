import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { LandNeighborDetector } from "@/engine/combat/state/synchronizer/land-neighbor-detector";
import { TerritoryCalibrator } from "@/engine/combat/state/synchronizer/territory-calibrator";

export class MapStateSynchronizer {
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
}
