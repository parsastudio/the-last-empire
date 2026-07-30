import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { CellAreaCalibrator } from "../cell-area-calibrator";

const EARTH_RADIUS = 6378137;
const TOTAL_SURFACE_AREA_SQ_KM =
  (4 * Math.PI * EARTH_RADIUS * EARTH_RADIUS) / 1000000;

export class TerritoryCalibrator {
  private calibrator = new CellAreaCalibrator(
    512,
    1024,
    TOTAL_SURFACE_AREA_SQ_KM,
  );

  public calibrateNationsTerritory(
    nations: Record<string, Nation>,
    allCells: GridCell[],
    landNeighborsMap: Map<string, Set<string>>,
    seaNeighborsMap: Map<string, Set<string>>,
    oceanAccessMap: Map<string, boolean>,
  ): Record<string, Nation> {
    const updated = { ...nations };

    const nationCellsMap = new Map<string, GridCell[]>();
    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      const owner = cell.ownerId;
      let list = nationCellsMap.get(owner);
      if (!list) {
        list = [];
        nationCellsMap.set(owner, list);
      }
      list.push(cell);
    }

    for (const [id, nation] of Object.entries(updated)) {
      const ownedCells = nationCellsMap.get(id) || [];

      let totalCalibratedArea = 0;
      for (let i = 0; i < ownedCells.length; i++) {
        totalCalibratedArea += this.calibrator.getCalibratedCellArea(
          ownedCells[i]!,
        );
      }

      let roundedArea = Math.round(totalCalibratedArea);
      if (roundedArea === 0 && nation.geography.territorySize > 0) {
        roundedArea = nation.geography.territorySize;
      }

      const lNeighbors = Array.from(landNeighborsMap.get(id) || []);
      const sNeighbors = Array.from(seaNeighborsMap.get(id) || []);
      const hasAccess = oceanAccessMap.get(id) || false;

      updated[id] = {
        ...nation,
        geography: {
          ...nation.geography,
          territorySize: roundedArea,
          contiguousMainlandSize: roundedArea,
          landNeighbors: lNeighbors,
          seaNeighbors: sNeighbors,
          hasSeaAccess: hasAccess,
        },
      };
    }

    return updated;
  }
}
