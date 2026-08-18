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
    const aspectRatio = bboxWidth / bboxHeight;

    let cols = Math.round(Math.sqrt(targetK * aspectRatio));
    let rows = Math.round(targetK / (cols || 1));

    cols = Math.max(1, cols);
    rows = Math.max(1, rows);

    while (cols * rows < targetK) {
      if (cols / rows < aspectRatio) {
        cols++;
      } else {
        rows++;
      }
    }

    const gridCellW = bboxWidth / cols;
    const gridCellH = bboxHeight / rows;

    const initialSeedCoords: { x: number; y: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (initialSeedCoords.length >= targetK) break;
        const targetX = minX + (c + 0.5) * gridCellW;
        const targetY = minY + (r + 0.5) * gridCellH;
        initialSeedCoords.push({ x: targetX, y: targetY });
      }
    }

    const seeds: number[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < initialSeedCoords.length; i++) {
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
