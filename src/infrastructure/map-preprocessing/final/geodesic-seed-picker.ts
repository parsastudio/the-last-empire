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

    this.updateEuclideanGeodesicDistances(
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
      this.updateEuclideanGeodesicDistances(
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

  private static updateEuclideanGeodesicDistances(
    seedIdx: number,
    minLandDistances: Float64Array,
    allPixelIndices: number[],
    pixelIndexMap: Map<number, number>,
    landPixelSet: Set<number>,
    width: number,
  ): void {
    void allPixelIndices;
    const seedX = seedIdx % width;
    const seedY = Math.floor(seedIdx / width);

    const queue: number[] = [seedIdx];
    const visited = new Set<number>();
    visited.add(seedIdx);

    const seedLocalArrayIdx = pixelIndexMap.get(seedIdx);
    if (seedLocalArrayIdx !== undefined) {
      minLandDistances[seedLocalArrayIdx] = 0;
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;
      const cx = curr % width;
      const cy = Math.floor(curr / width);

      const dx = cx - seedX;
      const dy = cy - seedY;
      const euclideanDist = Math.sqrt(dx * dx + dy * dy);

      const localArrayIdx = pixelIndexMap.get(curr);
      if (localArrayIdx !== undefined) {
        if (euclideanDist < minLandDistances[localArrayIdx]!) {
          minLandDistances[localArrayIdx] = euclideanDist;
        }
      }

      const neighbors: number[] = [];
      if (cx > 0) neighbors.push(curr - 1);
      if (cx < width - 1) neighbors.push(curr + 1);
      neighbors.push(curr + width);
      neighbors.push(curr - width);

      if (cx > 0) neighbors.push(curr + width - 1);
      if (cx < width - 1) neighbors.push(curr + width + 1);
      if (cx > 0) neighbors.push(curr - width - 1);
      if (cx < width - 1) neighbors.push(curr - width + 1);

      for (let i = 0; i < neighbors.length; i++) {
        const next = neighbors[i]!;
        if (landPixelSet.has(next) && !visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
  }
}
