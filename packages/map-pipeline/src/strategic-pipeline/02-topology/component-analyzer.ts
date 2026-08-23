import { LandComponent } from "@/infrastructure/core/types/map-pipeline.types";

export class ComponentAnalyzer {
  public static analyzeComponents(
    pixelIndices: number[],
    width: number,
  ): LandComponent[] {
    const pixelSet = new Set<number>(pixelIndices);
    const visited = new Set<number>();
    const components: LandComponent[] = [];

    const neighborOffsets = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: -1 },
    ];

    for (const startIdx of pixelIndices) {
      if (visited.has(startIdx)) continue;

      const compIndices: number[] = [];
      const queue: number[] = [startIdx];
      visited.add(startIdx);

      let sumX = 0;
      let sumY = 0;

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++]!;
        compIndices.push(curr);

        const cx = curr % width;
        const cy = Math.floor(curr / width);

        sumX += cx;
        sumY += cy;

        for (let i = 0; i < neighborOffsets.length; i++) {
          const off = neighborOffsets[i]!;
          const nx = (cx + off.dx + width) % width;
          const ny = cy + off.dy;

          if (ny >= 0) {
            const next = ny * width + nx;
            if (pixelSet.has(next) && !visited.has(next)) {
              visited.add(next);
              queue.push(next);
            }
          }
        }
      }

      const size = compIndices.length;
      components.push({
        pixelIndices: compIndices,
        size,
        centerX: Math.floor(sumX / (size || 1)),
        centerY: Math.floor(sumY / (size || 1)),
      });
    }

    components.sort((a, b) => b.size - a.size);
    return components;
  }
}
