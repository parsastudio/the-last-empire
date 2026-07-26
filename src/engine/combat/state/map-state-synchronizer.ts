import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { REAL_WORLD_COUNTRY_AREAS } from "../../../domain/map/country-area-calibration.config";

const EARTH_RADIUS = 6378137;
const TOTAL_SURFACE_AREA_SQ_KM =
  (4 * Math.PI * EARTH_RADIUS * EARTH_RADIUS) / 1000000;
const HEIGHT = 512;
const WIDTH = 1024;

export class MapStateSynchronizer {
  private weights: Float64Array;
  private areaPerWeightUnit: number;

  constructor() {
    let totalWeight = 0;
    this.weights = new Float64Array(HEIGHT);
    for (let y = 0; y < HEIGHT; y++) {
      const latitudeRad = (0.5 - (y + 0.5) / HEIGHT) * Math.PI;
      this.weights[y] = Math.cos(latitudeRad);
      totalWeight += this.weights[y] * WIDTH;
    }
    this.areaPerWeightUnit = TOTAL_SURFACE_AREA_SQ_KM / totalWeight;
  }

  public syncStateToGrid(state: GameState, gridState: GridState): GameState {
    const allCells = gridState.getAllCells();
    const updatedNations = { ...state.nations };

    const originalAreas: Record<string, number> = {};
    for (const id of Object.keys(state.nations)) {
      const originalCells = allCells.filter((c) => c.ownerId === id);
      let originalWeightedArea = 0;
      for (const cell of originalCells) {
        if (cell.y >= 0 && cell.y < HEIGHT) {
          const w = this.weights[cell.y] || 0;
          originalWeightedArea +=
            w * this.areaPerWeightUnit * (cell.highResPixelCount / 16);
        }
      }
      originalAreas[id] = originalWeightedArea;
    }

    const getCalibratedCellArea = (cell: GridCell): number => {
      if (cell.y < 0 || cell.y >= HEIGHT) return 0;
      const w = this.weights[cell.y] || 0;
      const cellArea =
        w * this.areaPerWeightUnit * (cell.highResPixelCount / 16);

      const originalOwner = cell.ownerId;
      const originalWeightedArea = originalAreas[originalOwner];
      if (!originalWeightedArea || originalWeightedArea === 0) {
        return cellArea;
      }

      const realArea =
        REAL_WORLD_COUNTRY_AREAS[originalOwner] ||
        REAL_WORLD_COUNTRY_AREAS[originalOwner.replace("NATION_", "")] ||
        REAL_WORLD_COUNTRY_AREAS[originalOwner.replace("NATION_", "NATION_")];

      if (realArea) {
        return cellArea * (realArea / originalWeightedArea);
      }
      return cellArea;
    };

    for (const [id, nation] of Object.entries(updatedNations)) {
      const ownedCells = allCells.filter(
        (c) =>
          (c.ownerId === id && !c.isOccupied) ||
          (c.isOccupied && c.occupierId === id),
      );

      let totalCalibratedArea = 0;
      for (const cell of ownedCells) {
        totalCalibratedArea += getCalibratedCellArea(cell);
      }

      const roundedArea = Math.round(totalCalibratedArea);

      updatedNations[id] = {
        ...nation,
        geography: {
          ...nation.geography,
          territorySize: roundedArea,
          contiguousMainlandSize: roundedArea,
        },
      };
    }

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
