import { GridState } from "@/engine/combat/state/grid-state";
import { MaritimeRangeBfs } from "@/engine/combat/state/maritime-range-bfs";

export interface NeighborDetectionResult {
  landNeighborsMap: Map<string, Set<string>>;
  seaNeighborsMap: Map<string, Set<string>>;
  oceanAccessMap: Map<string, boolean>;
}

export class LandNeighborDetector {
  private maritimeBfs = new MaritimeRangeBfs();
  private readonly width = 1024;
  private readonly height = 512;
  private readonly maxMaritimeRange = 25;

  public detectNeighbors(
    nationsKeys: string[],
    gridState: GridState,
  ): NeighborDetectionResult {
    const landNeighborsMap = new Map<string, Set<string>>();
    const seaNeighborsMap = new Map<string, Set<string>>();
    const oceanAccessMap = new Map<string, boolean>();

    for (const nationId of nationsKeys) {
      landNeighborsMap.set(nationId, new Set<string>());
      seaNeighborsMap.set(nationId, new Set<string>());
      oceanAccessMap.set(nationId, false);
    }

    const totalPixels = this.width * this.height;
    const queueX = new Int16Array(totalPixels);
    const queueY = new Int16Array(totalPixels);
    const queueDist = new Uint8Array(totalPixels);
    const queueSource = new Array<string>(totalPixels);

    let tail = 0;

    const visitedDist = new Uint8Array(totalPixels);
    visitedDist.fill(255);
    const visitedSource = new Array<string>(totalPixels);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
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
          if (nx < 0) nx = this.width - 1;
          else if (nx >= this.width) nx = 0;

          const ny = n.ny;
          if (ny >= 0 && ny < this.height) {
            const nCell = gridState.getCell(nx, ny);
            if (!nCell) continue;

            if (nCell.ownerId === "WATER") {
              oceanAccessMap.set(nationId, true);
            }

            if (nCell.ownerId === "WATER" || nCell.ownerId === "CLOSED_SEA") {
              const idx = ny * this.width + nx;
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

    this.maritimeBfs.run(
      this.width,
      this.height,
      this.maxMaritimeRange,
      gridState,
      visitedDist,
      visitedSource,
      queueX,
      queueY,
      queueDist,
      queueSource,
      tail,
      seaNeighborsMap,
    );

    return { landNeighborsMap, seaNeighborsMap, oceanAccessMap };
  }
}
