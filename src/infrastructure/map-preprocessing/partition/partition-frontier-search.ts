export interface FrontierSearchResult {
  frontiers: Map<number, number[]>;
  visited: Uint8Array;
}

export class PartitionFrontierSearch {
  public findInitialFrontiers(
    buffer: Uint8Array,
    width: number,
    height: number,
    removedIds: Set<number>,
    maxSearchRadius = 3,
  ): FrontierSearchResult {
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);
    const frontiers = new Map<number, number[]>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const id = buffer[idx]!;

        if (removedIds.has(id)) {
          let closestOwner = 0;
          let minSqDist = Infinity;

          for (let dy = -maxSearchRadius; dy <= maxSearchRadius; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;

            for (let dx = -maxSearchRadius; dx <= maxSearchRadius; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;

              const nIdx = ny * width + nx;
              const nId = buffer[nIdx]!;

              if (nId >= 11 && nId < 250 && !removedIds.has(nId)) {
                const sqDist = dx * dx + dy * dy;
                if (sqDist < minSqDist) {
                  minSqDist = sqDist;
                  closestOwner = nId;
                }
              }
            }
          }

          if (
            closestOwner > 0 &&
            minSqDist <= maxSearchRadius * maxSearchRadius + 1
          ) {
            if (!frontiers.has(closestOwner)) {
              frontiers.set(closestOwner, []);
            }
            frontiers.get(closestOwner)!.push(idx);
            visited[idx] = 1;
          }
        }
      }
    }

    return { frontiers, visited };
  }
}
