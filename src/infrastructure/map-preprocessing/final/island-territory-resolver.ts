export class IslandTerritoryResolver {
  private static readonly MAX_ISLAND_DISTANCE = 105;

  public static processIsolatedIslands(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    validNationIds: Set<number>,
  ): void {
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);

    const neighbors8 = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];

    for (let i = 0; i < totalPixels; i++) {
      if (assignmentGrid[i] !== 255 || visited[i] === 1) continue;

      const islandIndices: number[] = [];
      const queue: number[] = [i];
      visited[i] = 1;

      let head = 0;
      while (head < queue.length) {
        const currIdx = queue[head++]!;
        islandIndices.push(currIdx);

        const cx = currIdx % width;
        const cy = Math.floor(currIdx / width);

        for (let k = 0; k < 8; k++) {
          const nx = cx + neighbors8[k]!.dx;
          const ny = cy + neighbors8[k]!.dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (assignmentGrid[nIdx] === 255 && visited[nIdx] === 0) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }

      if (islandIndices.length === 0) continue;

      let nearestNation = 0;
      let minDistanceSq = Infinity;

      const sampleStep = Math.max(1, Math.floor(islandIndices.length / 40));
      for (let s = 0; s < islandIndices.length; s += sampleStep) {
        const pIdx = islandIndices[s]!;
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);

        const searchRadius = 60;
        for (let dy = -searchRadius; dy <= searchRadius; dy += 4) {
          const ny = py + dy;
          if (ny < 0 || ny >= height) continue;

          for (let dx = -searchRadius; dx <= searchRadius; dx += 4) {
            const nx = px + dx;
            if (nx < 0 || nx >= width) continue;

            const nIdx = ny * width + nx;
            const nNation = assignmentGrid[nIdx]!;

            if (validNationIds.has(nNation)) {
              const distSq = dx * dx + dy * dy;
              if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                nearestNation = nNation;
              }
            }
          }
        }
      }

      const maxAllowedDistSq =
        this.MAX_ISLAND_DISTANCE * this.MAX_ISLAND_DISTANCE;

      if (nearestNation > 0 && minDistanceSq <= maxAllowedDistSq) {
        for (let k = 0; k < islandIndices.length; k++) {
          const idx = islandIndices[k]!;
          assignmentGrid[idx] = nearestNation;
        }
      } else {
        for (let k = 0; k < islandIndices.length; k++) {
          const idx = islandIndices[k]!;
          assignmentGrid[idx] = 0;
        }
      }
    }
  }
}
