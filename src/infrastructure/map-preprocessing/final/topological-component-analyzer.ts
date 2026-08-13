import { LandComponent } from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export type { LandComponent };

export class TopologicalComponentAnalyzer {
  public static analyzeComponents(
    pixelIndices: number[],
    width: number,
  ): LandComponent[] {
    const pixelSet = new Set<number>(pixelIndices);
    const visited = new Set<number>();
    const components: LandComponent[] = [];

    const dirs = [
      1,
      -1,
      width,
      -width,
      width + 1,
      width - 1,
      -width + 1,
      -width - 1,
    ];

    for (const startIdx of pixelIndices) {
      if (visited.has(startIdx)) continue;

      const compIndices: number[] = [];
      const queue: number[] = [startIdx];
      visited.add(startIdx);

      let sumX = 0;
      let sumY = 0;
      let minX = startIdx % width;
      let maxX = minX;
      let minY = Math.floor(startIdx / width);
      let maxY = minY;

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++]!;
        compIndices.push(curr);

        const cx = curr % width;
        const cy = Math.floor(curr / width);

        sumX += cx;
        sumY += cy;

        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        for (const dir of dirs) {
          const next = curr + dir;
          if (pixelSet.has(next) && !visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }

      const size = compIndices.length;
      components.push({
        pixelIndices: compIndices,
        minX,
        maxX,
        minY,
        maxY,
        size,
        centerX: Math.floor(sumX / (size || 1)),
        centerY: Math.floor(sumY / (size || 1)),
      });
    }

    components.sort((a, b) => b.size - a.size);
    return components;
  }
}
