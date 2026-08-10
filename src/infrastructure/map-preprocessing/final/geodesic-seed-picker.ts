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

    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      sumX += idx % width;
      sumY += Math.floor(idx / width);
    }

    const centerX = Math.floor(sumX / allPixelIndices.length);
    const centerY = Math.floor(sumY / allPixelIndices.length);

    const sortedByCenterDist = [...allPixelIndices].sort((a, b) => {
      const ax = a % width;
      const ay = Math.floor(a / width);
      const bx = b % width;
      const by = Math.floor(b / width);
      const dA =
        (ax - centerX) * (ax - centerX) + (ay - centerY) * (ay - centerY);
      const dB =
        (bx - centerX) * (bx - centerX) + (by - centerY) * (by - centerY);
      return dA - dB;
    });

    const centerFractionCount = Math.max(
      1,
      Math.floor(allPixelIndices.length / targetK),
    );
    const centerPixels = sortedByCenterDist.slice(0, centerFractionCount);
    const outerPixels = sortedByCenterDist.slice(centerFractionCount);

    const seeds: number[] = [];

    let centerSeed = centerPixels[0]!;
    let minCenterDist = Infinity;
    for (let i = 0; i < centerPixels.length; i++) {
      const idx = centerPixels[i]!;
      const px = idx % width;
      const py = Math.floor(idx / width);
      const dist =
        (px - centerX) * (px - centerX) + (py - centerY) * (py - centerY);
      if (dist < minCenterDist) {
        minCenterDist = dist;
        centerSeed = idx;
      }
    }
    seeds.push(centerSeed);

    const outerSectorsCount = targetK - 1;
    if (outerSectorsCount > 0 && outerPixels.length > 0) {
      const sectorPixels: number[][] = Array.from(
        { length: outerSectorsCount },
        () => [],
      );

      const sectorAngleStep = (2.0 * Math.PI) / outerSectorsCount;

      for (let i = 0; i < outerPixels.length; i++) {
        const idx = outerPixels[i]!;
        const px = idx % width;
        const py = Math.floor(idx / width);
        let angle = Math.atan2(py - centerY, px - centerX);
        if (angle < 0) angle += 2.0 * Math.PI;

        const sectorIdx = Math.min(
          outerSectorsCount - 1,
          Math.floor(angle / sectorAngleStep),
        );
        sectorPixels[sectorIdx]!.push(idx);
      }

      for (let s = 0; s < outerSectorsCount; s++) {
        const pixelsInSector = sectorPixels[s]!;
        if (pixelsInSector.length === 0) {
          const fallback = outerPixels[s % outerPixels.length]!;
          seeds.push(fallback);
          continue;
        }

        let secSumX = 0;
        let secSumY = 0;
        for (let j = 0; j < pixelsInSector.length; j++) {
          const pIdx = pixelsInSector[j]!;
          secSumX += pIdx % width;
          secSumY += Math.floor(pIdx / width);
        }

        const secAvgX = Math.floor(secSumX / pixelsInSector.length);
        const secAvgY = Math.floor(secSumY / pixelsInSector.length);

        let bestSectorSeed = pixelsInSector[0]!;
        let minSectorDist = Infinity;

        for (let j = 0; j < pixelsInSector.length; j++) {
          const pIdx = pixelsInSector[j]!;
          const px = pIdx % width;
          const py = Math.floor(pIdx / width);
          const d =
            (px - secAvgX) * (px - secAvgX) + (py - secAvgY) * (py - secAvgY);
          if (d < minSectorDist) {
            minSectorDist = d;
            bestSectorSeed = pIdx;
          }
        }

        seeds.push(bestSectorSeed);
      }
    }

    return seeds;
  }
}
