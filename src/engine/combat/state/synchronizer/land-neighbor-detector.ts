import { GridState } from "@/engine/combat/state/grid-state";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export interface NeighborDetectionResult {
  landNeighborsMap: Map<string, Set<string>>;
  seaNeighborsMap: Map<string, Set<string>>;
  oceanAccessMap: Map<string, boolean>;
}

export class LandNeighborDetector {
  private readonly width = 1024;
  private readonly height = 512;
  private cachedResult: NeighborDetectionResult | null = null;
  private lastModifiedCount = -1;

  public detectNeighbors(
    nationsKeys: string[],
    gridState: GridState,
  ): NeighborDetectionResult {
    const currentModifiedCount = gridState.getModifiedCells().length;

    if (this.cachedResult && currentModifiedCount === this.lastModifiedCount) {
      return this.cachedResult;
    }

    const landNeighborsMap = new Map<string, Set<string>>();
    const seaNeighborsMap = new Map<string, Set<string>>();
    const oceanAccessMap = new Map<string, boolean>();

    for (let i = 0; i < nationsKeys.length; i++) {
      const rawKey = nationsKeys[i]!;
      const canonicalKey = NationIdResolver.resolveCanonicalId(rawKey);
      landNeighborsMap.set(canonicalKey, new Set<string>());
      seaNeighborsMap.set(canonicalKey, new Set<string>());
      oceanAccessMap.set(canonicalKey, false);
      landNeighborsMap.set(rawKey, new Set<string>());
      seaNeighborsMap.set(rawKey, new Set<string>());
      oceanAccessMap.set(rawKey, false);
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

    const neighborsOffset = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ownerId = gridArray[y * this.width + x];
        if (!ownerId || ownerId === "WATER" || ownerId === "CLOSED_SEA") {
          continue;
        }

        const canonicalOwner = NationIdResolver.resolveCanonicalId(ownerId);

        for (let k = 0; k < 4; k++) {
          const nx = (x + neighborsOffset[k]!.dx + this.width) % this.width;
          const ny = y + neighborsOffset[k]!.dy;

          if (ny < 0 || ny >= this.height) continue;

          const neighborOwner = gridArray[ny * this.width + nx];
          if (!neighborOwner) continue;

          if (neighborOwner === "WATER") {
            oceanAccessMap.set(canonicalOwner, true);
            oceanAccessMap.set(ownerId, true);
          } else if (
            neighborOwner !== ownerId &&
            neighborOwner !== "CLOSED_SEA"
          ) {
            const canonicalNeighbor =
              NationIdResolver.resolveCanonicalId(neighborOwner);
            if (canonicalNeighbor !== canonicalOwner) {
              landNeighborsMap.get(canonicalOwner)?.add(canonicalNeighbor);
              landNeighborsMap.get(ownerId)?.add(neighborOwner);
            }
          }
        }
      }
    }

    const result = { landNeighborsMap, seaNeighborsMap, oceanAccessMap };
    this.cachedResult = result;
    this.lastModifiedCount = currentModifiedCount;

    return result;
  }
}
