import { Nation } from "@/domain/nation/nation.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { CellAreaCalibrator } from "../cell-area-calibrator";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

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
    gridState: GridState,
    landNeighborsMap: Map<string, Set<string>>,
    seaNeighborsMap: Map<string, Set<string>>,
    oceanAccessMap: Map<string, boolean>,
  ): Record<string, Nation> {
    const updated = { ...nations };

    for (const [id, nation] of Object.entries(updated)) {
      const canonicalId = NationIdResolver.resolveCanonicalId(id);
      const ownedCells = gridState.getCellsByOwner(id);

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

      const lNeighbors = Array.from(
        landNeighborsMap.get(canonicalId) || landNeighborsMap.get(id) || [],
      );
      const sNeighbors = Array.from(
        seaNeighborsMap.get(canonicalId) || seaNeighborsMap.get(id) || [],
      );
      const hasAccess =
        oceanAccessMap.get(canonicalId) ??
        oceanAccessMap.get(id) ??
        nation.geography.hasSeaAccess ??
        false;

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
