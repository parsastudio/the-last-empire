import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ComponentMergeEngine,
  LandClusterComponent,
} from "@/engine/combat/final/component-merge-engine";

export class BitPackedEnclaveClusterer {
  private mergeEngine = new ComponentMergeEngine();

  public clusterTargetNations(
    buffer: BitPackedBuffer,
    targetNationIds: number[],
    width = 4096,
    height = 2048,
  ): void {
    if (targetNationIds.length === 0) return;

    const targetSet = new Set<number>(targetNationIds);
    const rawBuffer = buffer.getRawBuffer();
    const totalPixels = width * height;

    const nationPixelsMap = new Map<number, number[]>();
    for (let k = 0; k < targetNationIds.length; k++) {
      nationPixelsMap.set(targetNationIds[k]!, []);
    }

    for (let i = 0; i < totalPixels; i++) {
      const nId = rawBuffer[i]! & 0x00ff;
      if (targetSet.has(nId)) {
        nationPixelsMap.get(nId)!.push(i);
      }
    }

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];

    for (const [, pixelIndices] of nationPixelsMap.entries()) {
      if (pixelIndices.length === 0) continue;

      const nationPixelSet = new Set<number>(pixelIndices);
      const visitedInNation = new Set<number>();
      const rawComponents: LandClusterComponent[] = [];

      for (let k = 0; k < pixelIndices.length; k++) {
        const startIdx = pixelIndices[k]!;
        if (visitedInNation.has(startIdx)) continue;

        const compIndices: number[] = [];
        const queue: number[] = [startIdx];
        visitedInNation.add(startIdx);

        let minX = startIdx % width;
        let maxX = minX;
        let minY = Math.floor(startIdx / width);
        let maxY = minY;

        let head = 0;
        while (head < queue.length) {
          const currIdx = queue[head++]!;
          compIndices.push(currIdx);

          const cx = currIdx % width;
          const cy = Math.floor(currIdx / width);

          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);

          for (let i = 0; i < 8; i++) {
            let nx = cx + neighbors[i]!.dx;
            if (nx < 0) nx = width - 1;
            else if (nx >= width) nx = 0;

            const ny = cy + neighbors[i]!.dy;
            if (ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!visitedInNation.has(nIdx) && nationPixelSet.has(nIdx)) {
                visitedInNation.add(nIdx);
                queue.push(nIdx);
              }
            }
          }
        }

        rawComponents.push({
          pixelIndices: compIndices,
          minX,
          maxX,
          minY,
          maxY,
          size: compIndices.length,
        });
      }

      const mergedComponents = this.mergeEngine.mergeNearComponents(
        rawComponents,
        width,
        300,
      );

      mergedComponents.sort((a, b) => b.size - a.size);

      for (let cIdx = 0; cIdx < mergedComponents.length; cIdx++) {
        const comp = mergedComponents[cIdx]!;
        const enclaveId = Math.min(31, cIdx);

        for (let pIdx = 0; pIdx < comp.pixelIndices.length; pIdx++) {
          const idx = comp.pixelIndices[pIdx]!;
          const x = idx % width;
          const y = Math.floor(idx / width);
          buffer.setEnclaveId(x, y, enclaveId);
        }
      }
    }
  }
}
