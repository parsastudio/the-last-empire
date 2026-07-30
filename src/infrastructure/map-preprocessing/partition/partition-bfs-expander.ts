export class PartitionBfsExpander {
  public expandFrontiers(
    buffer: Uint8Array,
    width: number,
    height: number,
    frontiers: Map<number, number[]>,
    visited: Uint8Array,
    removedIds: Set<number>,
    growthPerTurn = 150,
  ): void {
    const activeNeighbors = Array.from(frontiers.keys());
    let hasActiveFrontier = activeNeighbors.length > 0;

    while (hasActiveFrontier) {
      hasActiveFrontier = false;

      for (const neighborId of activeNeighbors) {
        const queue = frontiers.get(neighborId);
        if (!queue || queue.length === 0) continue;

        hasActiveFrontier = true;
        const limit = Math.min(queue.length, growthPerTurn);

        for (let i = 0; i < limit; i++) {
          const idx = queue.shift()!;
          buffer[idx] = neighborId;

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
                const nId = buffer[nIdx]!;
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

    this.fillUnreachableOrphans(buffer, width, height, removedIds);
  }

  private fillUnreachableOrphans(
    buffer: Uint8Array,
    width: number,
    height: number,
    removedIds: Set<number>,
  ): void {
    const fallbackRadius = 15;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (removedIds.has(buffer[idx]!)) {
          let closestOwner = 0;
          let minSqDist = Infinity;

          for (let dy = -fallbackRadius; dy <= fallbackRadius; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;

            for (let dx = -fallbackRadius; dx <= fallbackRadius; dx++) {
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

          buffer[idx] = closestOwner > 0 ? closestOwner : 250;
        }
      }
    }
  }
}
