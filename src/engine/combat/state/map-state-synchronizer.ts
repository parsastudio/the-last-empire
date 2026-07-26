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

    const landNeighborsMap = new Map<string, Set<string>>();
    const seaNeighborsMap = new Map<string, Set<string>>();
    const oceanAccessMap = new Map<string, boolean>();
    const gulfTouchMap = new Map<string, Set<string>>();

    for (const nationId of Object.keys(state.nations)) {
      landNeighborsMap.set(nationId, new Set<string>());
      seaNeighborsMap.set(nationId, new Set<string>());
      oceanAccessMap.set(nationId, false);
      gulfTouchMap.set(nationId, new Set<string>());
    }

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const cell = gridState.getCell(x, y);
        if (
          !cell ||
          cell.ownerId === "WATER" ||
          cell.ownerId === "CLOSED_SEA"
        ) {
          continue;
        }

        const nationId =
          cell.isOccupied && cell.occupierId ? cell.occupierId : cell.ownerId;
        const neighbors = [
          gridState.getCell(x + 1, y),
          gridState.getCell(x - 1, y),
          gridState.getCell(x, y + 1),
          gridState.getCell(x, y - 1),
        ];

        for (const neighbor of neighbors) {
          if (!neighbor) continue;
          if (neighbor.ownerId === "WATER") {
            oceanAccessMap.set(nationId, true);
          } else if (neighbor.ownerId === "CLOSED_SEA") {
            gulfTouchMap.get(nationId)?.add("CLOSED_SEA");
          } else {
            const neighborNationId =
              neighbor.isOccupied && neighbor.occupierId
                ? neighbor.occupierId
                : neighbor.ownerId;
            if (neighborNationId !== nationId) {
              landNeighborsMap.get(nationId)?.add(neighborNationId);
            }
          }
        }
      }
    }

    const nationIds = Object.keys(state.nations);
    for (const nA of nationIds) {
      for (const nB of nationIds) {
        if (nA !== nB) {
          const gulfsA = gulfTouchMap.get(nA);
          const gulfsB = gulfTouchMap.get(nB);
          if (gulfsA && gulfsB) {
            let sharedGulf = false;
            for (const g of gulfsA) {
              if (gulfsB.has(g)) {
                sharedGulf = true;
                break;
              }
            }
            if (sharedGulf) {
              seaNeighborsMap.get(nA)?.add(nB);
            }
          }
        }
      }
    }

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
      const lNeighbors = Array.from(landNeighborsMap.get(id) || []);
      const sNeighbors = Array.from(seaNeighborsMap.get(id) || []);
      const hasAccess = oceanAccessMap.get(id) || false;

      updatedNations[id] = {
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

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
