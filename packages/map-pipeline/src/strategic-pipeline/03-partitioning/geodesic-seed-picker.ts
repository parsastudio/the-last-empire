export class GeodesicSeedPicker {
  public static pickSeeds(
    allPixelIndices: number[],
    targetK: number,
    width: number,
  ): number[] {
    if (allPixelIndices.length === 0 || targetK <= 0) {
      return [];
    }

    if (targetK === 1 || allPixelIndices.length <= targetK) {
      return [allPixelIndices[Math.floor(allPixelIndices.length / 2)]!];
    }

    const pixelSet = new Set<number>(allPixelIndices);
    const centerPixel = this.findCenterPixel(allPixelIndices, width);
    const extremeA = this.findFurthestPixel(centerPixel, pixelSet, width);
    const extremeB = this.findFurthestPixel(extremeA, pixelSet, width);

    if (targetK === 2) {
      const path = this.findGeodesicPath(extremeA, extremeB, pixelSet, width);
      if (path.length >= 2) {
        const seed1 = path[Math.floor(path.length * 0.3)]!;
        const seed2 = path[Math.floor(path.length * 0.7)]!;
        return [seed1, seed2];
      }
      return [extremeA, extremeB];
    }

    const seeds: number[] = [extremeA, extremeB];
    const minGeodesicDistances = new Map<number, number>();

    for (let i = 0; i < allPixelIndices.length; i++) {
      minGeodesicDistances.set(allPixelIndices[i]!, Infinity);
    }

    this.updateDistancesFromSeed(
      extremeA,
      pixelSet,
      minGeodesicDistances,
      width,
    );
    this.updateDistancesFromSeed(
      extremeB,
      pixelSet,
      minGeodesicDistances,
      width,
    );

    while (seeds.length < targetK) {
      let maxDist = -1;
      let nextSeed = allPixelIndices[0]!;

      for (let i = 0; i < allPixelIndices.length; i++) {
        const idx = allPixelIndices[i]!;
        const d = minGeodesicDistances.get(idx) ?? 0;
        if (d !== Infinity && d > maxDist) {
          maxDist = d;
          nextSeed = idx;
        }
      }

      if (maxDist <= 0 || seeds.includes(nextSeed)) {
        for (let i = 0; i < allPixelIndices.length; i++) {
          const fallback = allPixelIndices[i]!;
          if (!seeds.includes(fallback)) {
            nextSeed = fallback;
            break;
          }
        }
      }

      seeds.push(nextSeed);
      this.updateDistancesFromSeed(
        nextSeed,
        pixelSet,
        minGeodesicDistances,
        width,
      );
    }

    return seeds;
  }

  private static findCenterPixel(
    pixelIndices: number[],
    width: number,
  ): number {
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < pixelIndices.length; i++) {
      const idx = pixelIndices[i]!;
      sumX += idx % width;
      sumY += Math.floor(idx / width);
    }

    const avgX = Math.floor(sumX / pixelIndices.length);
    const avgY = Math.floor(sumY / pixelIndices.length);

    let bestIdx = pixelIndices[0]!;
    let minDistanceSq = Infinity;

    for (let i = 0; i < pixelIndices.length; i++) {
      const idx = pixelIndices[i]!;
      const px = idx % width;
      const py = Math.floor(idx / width);
      const directDx = Math.abs(px - avgX);
      const dx = Math.min(directDx, width - directDx);
      const dy = py - avgY;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestIdx = idx;
      }
    }

    return bestIdx;
  }

  private static findFurthestPixel(
    startIdx: number,
    pixelSet: Set<number>,
    width: number,
  ): number {
    const queue: number[] = [startIdx];
    const dist = new Map<number, number>();
    dist.set(startIdx, 0);

    let furthestIdx = startIdx;
    let maxDist = 0;

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: -1 },
    ];

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;
      const d = dist.get(curr)!;

      if (d > maxDist) {
        maxDist = d;
        furthestIdx = curr;
      }

      const cx = curr % width;
      const cy = Math.floor(curr / width);

      for (let i = 0; i < dirs.length; i++) {
        const off = dirs[i]!;
        const nx = (cx + off.dx + width) % width;
        const ny = cy + off.dy;

        if (ny >= 0) {
          const next = ny * width + nx;
          if (pixelSet.has(next) && !dist.has(next)) {
            dist.set(next, d + 1);
            queue.push(next);
          }
        }
      }
    }

    return furthestIdx;
  }

  private static findGeodesicPath(
    fromIdx: number,
    toIdx: number,
    pixelSet: Set<number>,
    width: number,
  ): number[] {
    const queue: number[] = [fromIdx];
    const visited = new Set<number>([fromIdx]);
    const parent = new Map<number, number>();

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: -1 },
    ];

    let head = 0;
    let found = false;

    while (head < queue.length) {
      const curr = queue[head++]!;
      if (curr === toIdx) {
        found = true;
        break;
      }

      const cx = curr % width;
      const cy = Math.floor(curr / width);

      for (let i = 0; i < dirs.length; i++) {
        const off = dirs[i]!;
        const nx = (cx + off.dx + width) % width;
        const ny = cy + off.dy;

        if (ny >= 0) {
          const next = ny * width + nx;
          if (pixelSet.has(next) && !visited.has(next)) {
            visited.add(next);
            parent.set(next, curr);
            queue.push(next);
          }
        }
      }
    }

    if (!found) return [fromIdx, toIdx];

    const path: number[] = [];
    let curr: number | undefined = toIdx;
    while (curr !== undefined) {
      path.push(curr);
      curr = parent.get(curr);
    }

    return path.reverse();
  }

  private static updateDistancesFromSeed(
    seedIdx: number,
    pixelSet: Set<number>,
    minGeodesicDistances: Map<number, number>,
    width: number,
  ): void {
    const queue: number[] = [seedIdx];
    const localDist = new Map<number, number>();
    localDist.set(seedIdx, 0);

    const dirs = [
      { dx: 1, dy: 0, cost: 10 },
      { dx: -1, dy: 0, cost: 10 },
      { dx: 0, dy: 1, cost: 10 },
      { dx: 0, dy: -1, cost: 10 },
      { dx: 1, dy: 1, cost: 14 },
      { dx: -1, dy: 1, cost: 14 },
      { dx: 1, dy: -1, cost: 14 },
      { dx: -1, dy: -1, cost: 14 },
    ];

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;
      const currD = localDist.get(curr)!;

      const currentGlobalMin = minGeodesicDistances.get(curr) ?? Infinity;
      if (currD < currentGlobalMin) {
        minGeodesicDistances.set(curr, currD);
      }

      const cx = curr % width;
      const cy = Math.floor(curr / width);

      for (let i = 0; i < dirs.length; i++) {
        const off = dirs[i]!;
        const nx = (cx + off.dx + width) % width;
        const ny = cy + off.dy;

        if (ny >= 0) {
          const next = ny * width + nx;
          if (!pixelSet.has(next)) continue;

          const nextD = currD + off.cost;
          const prevLocalD = localDist.get(next);

          if (prevLocalD === undefined || nextD < prevLocalD) {
            localDist.set(next, nextD);
            queue.push(next);
          }
        }
      }
    }
  }
}
