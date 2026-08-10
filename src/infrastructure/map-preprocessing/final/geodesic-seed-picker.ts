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

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const px = idx % width;
      const py = Math.floor(idx / width);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }

    const bboxWidth = Math.max(1, maxX - minX);
    const bboxHeight = Math.max(1, maxY - minY);

    const landArea = allPixelIndices.length;
    const targetHexRadius = Math.sqrt(
      (2.0 * landArea) / (Math.sqrt(3) * targetK * 1.15),
    );

    const dx = Math.max(12, targetHexRadius);
    const dy = Math.max(12, targetHexRadius * (Math.sqrt(3) / 2.0));

    const initialSeedCoords: { x: number; y: number }[] = [];
    let row = 0;

    for (let y = minY + dy / 2; y <= maxY; y += dy) {
      const xOffset = row % 2 === 1 ? dx / 2 : 0;
      for (let x = minX + dx / 2 + xOffset; x <= maxX; x += dx) {
        initialSeedCoords.push({ x, y });
      }
      row++;
    }

    if (initialSeedCoords.length === 0) {
      initialSeedCoords.push({
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
      });
    }

    const seeds: number[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < initialSeedCoords.length; i++) {
      if (seeds.length >= targetK) break;

      const target = initialSeedCoords[i]!;
      let bestIdx = -1;
      let minDistance = Infinity;

      for (let j = 0; j < allPixelIndices.length; j++) {
        const pIdx = allPixelIndices[j]!;
        if (usedIndices.has(pIdx)) continue;

        const px = pIdx % width;
        const py = Math.floor(pIdx / width);
        const distSq =
          (px - target.x) * (px - target.x) + (py - target.y) * (py - target.y);

        if (distSq < minDistance) {
          minDistance = distSq;
          bestIdx = pIdx;
        }
      }

      if (bestIdx !== -1) {
        usedIndices.add(bestIdx);
        seeds.push(bestIdx);
      }
    }

    while (seeds.length < targetK) {
      let maxDist = -1;
      let bestFallback = allPixelIndices[0]!;

      for (let j = 0; j < allPixelIndices.length; j++) {
        const pIdx = allPixelIndices[j]!;
        if (usedIndices.has(pIdx)) continue;

        const px = pIdx % width;
        const py = Math.floor(pIdx / width);

        let minSeedDist = Infinity;
        for (let s = 0; s < seeds.length; s++) {
          const sIdx = seeds[s]!;
          const sx = sIdx % width;
          const sy = Math.floor(sIdx / width);
          const d = (px - sx) * (px - sx) + (py - sy) * (py - sy);
          if (d < minSeedDist) minSeedDist = d;
        }

        if (minSeedDist > maxDist) {
          maxDist = minSeedDist;
          bestFallback = pIdx;
        }
      }

      usedIndices.add(bestFallback);
      seeds.push(bestFallback);
    }

    return seeds;
  }
}
