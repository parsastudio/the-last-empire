import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { GLOBAL_DEVIATION_FACTOR } from "../../../domain/map/country-area-calibration.config";

const EARTH_RADIUS = 6378137;
const TOTAL_SURFACE_AREA_SQ_KM =
  (4 * Math.PI * EARTH_RADIUS * EARTH_RADIUS) / 1000000;
const HEIGHT = 512;
const WIDTH = 1024;
const MAX_MARITIME_RANGE = 25;

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

    const getCalibratedCellArea = (cell: GridCell): number => {
      if (cell.y < 0 || cell.y >= HEIGHT) return 0;
      const w = this.weights[cell.y] || 0;
      const cellArea =
        w * this.areaPerWeightUnit * (cell.highResPixelCount / 16);
      return cellArea * GLOBAL_DEVIATION_FACTOR;
    };

    const landNeighborsMap = new Map<string, Set<string>>();
    const seaNeighborsMap = new Map<string, Set<string>>();
    const oceanAccessMap = new Map<string, boolean>();

    for (const nationId of Object.keys(state.nations)) {
      landNeighborsMap.set(nationId, new Set<string>());
      seaNeighborsMap.set(nationId, new Set<string>());
      oceanAccessMap.set(nationId, false);
    }

    const totalPixels = WIDTH * HEIGHT;
    const queueX = new Int16Array(totalPixels);
    const queueY = new Int16Array(totalPixels);
    const queueDist = new Uint8Array(totalPixels);
    const queueSource = new Array<string>(totalPixels);

    let head = 0;
    let tail = 0;

    const visitedDist = new Uint8Array(totalPixels);
    visitedDist.fill(255);
    const visitedSource = new Array<string>(totalPixels);

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
          { nx: x + 1, ny: y },
          { nx: x - 1, ny: y },
          { nx: x, ny: y + 1 },
          { nx: x, ny: y - 1 },
        ];

        for (const n of neighbors) {
          let nx = n.nx;
          if (nx < 0) nx = WIDTH - 1;
          else if (nx >= WIDTH) nx = 0;

          const ny = n.ny;
          if (ny >= 0 && ny < HEIGHT) {
            const nCell = gridState.getCell(nx, ny);
            if (!nCell) continue;

            if (nCell.ownerId === "WATER") {
              oceanAccessMap.set(nationId, true);
            }

            if (nCell.ownerId === "WATER" || nCell.ownerId === "CLOSED_SEA") {
              const idx = ny * WIDTH + nx;
              if (visitedDist[idx] === 255) {
                visitedDist[idx] = 0;
                visitedSource[idx] = nationId;
                queueX[tail] = nx;
                queueY[tail] = ny;
                queueDist[tail] = 0;
                queueSource[tail] = nationId;
                tail++;
              }
            } else {
              const neighborNationId =
                nCell.isOccupied && nCell.occupierId
                  ? nCell.occupierId
                  : nCell.ownerId;
              if (neighborNationId !== nationId) {
                landNeighborsMap.get(nationId)?.add(neighborNationId);
              }
            }
          }
        }
      }
    }

    while (head < tail) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      const cd = queueDist[head]!;
      const cs = queueSource[head]!;
      head++;

      if (cd >= MAX_MARITIME_RANGE) {
        continue;
      }

      const neighbors = [
        { nx: cx + 1, ny: cy },
        { nx: cx - 1, ny: cy },
        { nx: cx, ny: cy + 1 },
        { nx: cx, ny: cy - 1 },
      ];

      for (const n of neighbors) {
        let nx = n.nx;
        if (nx < 0) {
          nx = 1023;
        } else if (nx >= 1024) {
          nx = 0;
        }

        const ny = n.ny;
        if (ny >= 0 && ny < 512) {
          const nCell = gridState.getCell(nx, ny);
          if (
            nCell &&
            (nCell.ownerId === "WATER" || nCell.ownerId === "CLOSED_SEA")
          ) {
            const idx = ny * WIDTH + nx;
            const existingDist = visitedDist[idx]!;

            if (existingDist === 255) {
              visitedDist[idx] = cd + 1;
              visitedSource[idx] = cs;
              queueX[tail] = nx;
              queueY[tail] = ny;
              queueDist[tail] = cd + 1;
              queueSource[tail] = cs;
              tail++;
            } else {
              const existingSource = visitedSource[idx]!;
              if (existingSource !== cs) {
                seaNeighborsMap.get(cs)?.add(existingSource);
                seaNeighborsMap.get(existingSource)?.add(cs);
              }
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
