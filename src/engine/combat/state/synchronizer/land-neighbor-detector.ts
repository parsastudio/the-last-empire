import { GridState } from "@/engine/combat/state/grid-state";

export interface NeighborDetectionResult {
  landNeighborsMap: Map<string, Set<string>>;
  seaNeighborsMap: Map<string, Set<string>>;
  oceanAccessMap: Map<string, boolean>;
}

export class LandNeighborDetector {
  private readonly width = 1024;
  private readonly height = 512;

  public detectNeighbors(
    nationsKeys: string[],
    gridState: GridState,
  ): NeighborDetectionResult {
    const landNeighborsMap = new Map<string, Set<string>>();
    const seaNeighborsMap = new Map<string, Set<string>>();
    const oceanAccessMap = new Map<string, boolean>();

    for (let i = 0; i < nationsKeys.length; i++) {
      const nationId = nationsKeys[i]!;
      landNeighborsMap.set(nationId, new Set<string>());
      seaNeighborsMap.set(nationId, new Set<string>());
      oceanAccessMap.set(nationId, false);
    }

    const allCells = gridState.getAllCells();
    if (allCells.length === 0) {
      return { landNeighborsMap, seaNeighborsMap, oceanAccessMap };
    }

    const gridArray = new Array<string>(this.width * this.height);
    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      gridArray[cell.y * this.width + cell.x] = cell.ownerId;
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ownerId = gridArray[y * this.width + x];
        if (!ownerId || ownerId === "WATER" || ownerId === "CLOSED_SEA") {
          continue;
        }

        const rightX = (x + 1) % this.width;
        const rightOwner = gridArray[y * this.width + rightX];
        if (rightOwner && rightOwner !== ownerId) {
          if (rightOwner === "WATER" || rightOwner === "CLOSED_SEA") {
            oceanAccessMap.set(ownerId, true);
          } else {
            landNeighborsMap.get(ownerId)?.add(rightOwner);
            landNeighborsMap.get(rightOwner)?.add(ownerId);
          }
        }

        if (y < this.height - 1) {
          const bottomOwner = gridArray[(y + 1) * this.width + x];
          if (bottomOwner && bottomOwner !== ownerId) {
            if (bottomOwner === "WATER" || bottomOwner === "CLOSED_SEA") {
              oceanAccessMap.set(ownerId, true);
            } else {
              landNeighborsMap.get(ownerId)?.add(bottomOwner);
              landNeighborsMap.get(bottomOwner)?.add(ownerId);
            }
          }
        }
      }
    }

    return { landNeighborsMap, seaNeighborsMap, oceanAccessMap };
  }
}
