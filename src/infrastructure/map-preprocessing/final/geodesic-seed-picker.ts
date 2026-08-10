export class GeodesicSeedPicker {
  public static pickSeeds(
    allPixelIndices: number[],
    targetK: number,
    width: number,
    height: number,
  ): number[] {
    if (allPixelIndices.length === 0 || targetK <= 0) {
      return [];
    }

    if (targetK === 1 || allPixelIndices.length <= targetK) {
      return [allPixelIndices[Math.floor(allPixelIndices.length / 2)]!];
    }

    const landPixelSet = new Set<number>(allPixelIndices);
    const totalMapPixels = width * height;
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

    const minLandDistances = new Uint32Array(totalMapPixels);
    minLandDistances.fill(0xffffffff);

    this.updateDistancesFromSeed(
      firstSeed,
      minLandDistances,
      landPixelSet,
      width,
    );

    for (let s = 1; s < targetK; s++) {
      let maxDist = 0;
      let nextSeed = allPixelIndices[0]!;

      for (let i = 0; i < allPixelIndices.length; i++) {
        const idx = allPixelIndices[i]!;
        const dist = minLandDistances[idx]!;
        if (dist !== 0xffffffff && dist > maxDist) {
          maxDist = dist;
          nextSeed = idx;
        }
      }

      if (nextSeed === seeds[seeds.length - 1]) {
        for (let i = 0; i < allPixelIndices.length; i++) {
          const fallbackIdx = allPixelIndices[i]!;
          if (!seeds.includes(fallbackIdx)) {
            nextSeed = fallbackIdx;
            break;
          }
        }
      }

      seeds.push(nextSeed);
      this.updateDistancesFromSeed(
        nextSeed,
        minLandDistances,
        landPixelSet,
        width,
      );
    }

    return seeds;
  }

  private static updateDistancesFromSeed(
    seedIdx: number,
    minLandDistances: Uint32Array,
    landPixelSet: Set<number>,
    width: number,
  ): void {
    const queue: number[] = [seedIdx];
    minLandDistances[seedIdx] = 0;

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;
      const currDist = minLandDistances[curr]!;

      const cx = curr % width;

      const candidates: number[] = [];
      if (cx > 0) candidates.push(curr - 1);
      if (cx < width - 1) candidates.push(curr + 1);
      if (curr + width < minLandDistances.length) candidates.push(curr + width);
      if (curr - width >= 0) candidates.push(curr - width);

      for (let i = 0; i < candidates.length; i++) {
        const next = candidates[i]!;
        if (landPixelSet.has(next)) {
          const nextDist = currDist + 1;
          if (nextDist < minLandDistances[next]!) {
            minLandDistances[next] = nextDist;
            queue.push(next);
          }
        }
      }
    }
  }
}
