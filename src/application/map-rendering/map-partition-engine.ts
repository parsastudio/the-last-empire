import { PARTITION_COUNTRIES_LIST } from "./partition-config";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export class MapPartitionEngine {
  public applyPartition(
    buffer: Uint8Array,
    width: number,
    height: number,
    countries: CountryMapping[],
  ): Uint8Array {
    const resultBuffer = new Uint8Array(buffer);
    const removedIds = new Set<number>();

    for (const country of countries) {
      if (PARTITION_COUNTRIES_LIST.includes(country.code)) {
        removedIds.add(country.id);
      }
    }

    if (removedIds.size === 0) {
      return resultBuffer;
    }

    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);
    const frontiers = new Map<number, number[]>();

    const maxSearchRadius = 3;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const id = resultBuffer[idx]!;

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
              const nId = resultBuffer[nIdx]!;

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

    const activeNeighbors = Array.from(frontiers.keys());
    const growthPerTurn = 150;
    let hasActiveFrontier = activeNeighbors.length > 0;

    while (hasActiveFrontier) {
      hasActiveFrontier = false;

      for (const neighborId of activeNeighbors) {
        const queue = frontiers.get(neighborId)!;
        if (queue.length === 0) {
          continue;
        }

        hasActiveFrontier = true;
        const limit = Math.min(queue.length, growthPerTurn);

        for (let i = 0; i < limit; i++) {
          const idx = queue.shift()!;
          resultBuffer[idx] = neighborId;

          const x = idx % width;
          const y = Math.floor(idx / width);

          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;

            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;

              const nIdx = ny * width + nx;
              if (visited[nIdx] === 0) {
                const nId = resultBuffer[nIdx]!;
                if (removedIds.has(nId)) {
                  visited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (removedIds.has(resultBuffer[idx]!)) {
          let closestOwner = 0;
          let minSqDist = Infinity;

          const fallbackRadius = 15;
          for (let dy = -fallbackRadius; dy <= fallbackRadius; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;

            for (let dx = -fallbackRadius; dx <= fallbackRadius; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;

              const nIdx = ny * width + nx;
              const nId = resultBuffer[nIdx]!;

              if (nId >= 11 && nId < 250 && !removedIds.has(nId)) {
                const sqDist = dx * dx + dy * dy;
                if (sqDist < minSqDist) {
                  minSqDist = sqDist;
                  closestOwner = nId;
                }
              }
            }
          }

          if (closestOwner > 0) {
            resultBuffer[idx] = closestOwner;
          } else {
            resultBuffer[idx] = 250;
          }
        }
      }
    }

    return resultBuffer;
  }
}
