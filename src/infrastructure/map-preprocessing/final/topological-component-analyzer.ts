import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export interface LandComponent {
  id: number;
  pixelIndices: number[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  size: number;
  centerX: number;
  centerY: number;
  isMicroIsland: boolean;
}

export class TopologicalComponentAnalyzer {
  public static readonly MICRO_ISLAND_THRESHOLD = 400;

  public static analyzeComponents(
    pixelIndices: number[],
    width: number,
    height: number,
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

    let compId = 1;
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
        id: compId++,
        pixelIndices: compIndices,
        minX,
        maxX,
        minY,
        maxY,
        size,
        centerX: Math.floor(sumX / (size || 1)),
        centerY: Math.floor(sumY / (size || 1)),
        isMicroIsland: size < this.MICRO_ISLAND_THRESHOLD,
      });
    }

    components.sort((a, b) => b.size - a.size);
    return components;
  }
}
