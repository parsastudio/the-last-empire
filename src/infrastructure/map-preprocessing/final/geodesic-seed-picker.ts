export class GeodesicSeedPicker {
  public static pickSeeds(
    allPixelIndices: number[],
    targetK: number,
    width: number,
    height: number,
  ): number[] {
    void height;
    if (allPixelIndices.length === 0 || targetK <= 0) {
      return [];
    }

    if (targetK === 1 || allPixelIndices.length <= targetK) {
      return [allPixelIndices[Math.floor(allPixelIndices.length / 2)]!];
    }

    const landPixelSet = new Set<number>(allPixelIndices);
    const seeds: number[] = [];

    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      sumX += idx % width;
      sumY += Math.floor(idx / width);
    }

    const avgX = Math.floor(sumX / allPixelIndices.length);
    const avgY = Math.floor(sumY / allPixelIndices.length);

    let firstSeed = allPixelIndices[0]!;
    let minCenterDist = Infinity;

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const px = idx % width;
      const py = Math.floor(idx / width);
      const distSq = (px - avgX) * (px - avgX) + (py - avgY) * (py - avgY);
      if (distSq < minCenterDist) {
        minCenterDist = distSq;
        firstSeed = idx;
      }
    }

    seeds.push(firstSeed);

    const minLandDistances = new Float64Array(allPixelIndices.length);
    minLandDistances.fill(Infinity);

    const pixelIndexMap = new Map<number, number>();
    for (let i = 0; i < allPixelIndices.length; i++) {
      pixelIndexMap.set(allPixelIndices[i]!, i);
    }

    this.updateLandPathDistances(
      firstSeed,
      minLandDistances,
      allPixelIndices,
      pixelIndexMap,
      landPixelSet,
      width,
    );

    for (let s = 1; s < targetK; s++) {
      let maxDist = -1;
      let nextSeed = allPixelIndices[0]!;

      for (let i = 0; i < allPixelIndices.length; i++) {
        const dist = minLandDistances[i]!;
        if (dist !== Infinity && dist > maxDist) {
          maxDist = dist;
          nextSeed = allPixelIndices[i]!;
        }
      }

      if (seeds.includes(nextSeed)) {
        for (let i = 0; i < allPixelIndices.length; i++) {
          const fallback = allPixelIndices[i]!;
          if (!seeds.includes(fallback)) {
            nextSeed = fallback;
            break;
          }
        }
      }

      seeds.push(nextSeed);
      this.updateLandPathDistances(
        nextSeed,
        minLandDistances,
        allPixelIndices,
        pixelIndexMap,
        landPixelSet,
        width,
      );
    }

    return seeds;
  }

  private static updateLandPathDistances(
    seedIdx: number,
    minLandDistances: Float64Array,
    allPixelIndices: number[],
    pixelIndexMap: Map<number, number>,
    landPixelSet: Set<number>,
    width: number,
  ): void {
    void allPixelIndices;
    const queue: number[] = [seedIdx];
    const localIdx = pixelIndexMap.get(seedIdx);
    if (localIdx !== undefined && minLandDistances[localIdx]! > 0) {
      minLandDistances[localIdx] = 0;
    }

    const distMap = new Map<number, number>();
    distMap.set(seedIdx, 0);

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;
      const currDist = distMap.get(curr)!;
      const cx = curr % width;

      const arrayIdx = pixelIndexMap.get(curr);
      if (arrayIdx !== undefined) {
        if (currDist < minLandDistances[arrayIdx]!) {
          minLandDistances[arrayIdx] = currDist;
        }
      }

      const neighbors: number[] = [];
      if (cx > 0) neighbors.push(curr - 1);
      if (cx < width - 1) neighbors.push(curr + 1);
      neighbors.push(curr + width);
      neighbors.push(curr - width);

      for (let i = 0; i < neighbors.length; i++) {
        const next = neighbors[i]!;
        if (landPixelSet.has(next)) {
          const nextDist = currDist + 1;
          if (!distMap.has(next) || nextDist < distMap.get(next)!) {
            distMap.set(next, nextDist);
            queue.push(next);
          }
        }
      }
    }
  }
}
