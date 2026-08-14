import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class WaterBodyClassifier {
  public static classifyOceanAndLakes(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
  ): void {
    const totalPixels = width * height;
    const isOcean = new Uint8Array(totalPixels);
    const oceanQueue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    for (let x = 0; x < width; x++) {
      const topIdx = x;
      if (assignmentGrid[topIdx] === 0 && isOcean[topIdx] === 0) {
        isOcean[topIdx] = 1;
        oceanQueue[qTail++] = topIdx;
      }
      const btmIdx = (height - 1) * width + x;
      if (assignmentGrid[btmIdx] === 0 && isOcean[btmIdx] === 0) {
        isOcean[btmIdx] = 1;
        oceanQueue[qTail++] = btmIdx;
      }
    }

    for (let y = 0; y < height; y++) {
      const lIdx = y * width;
      if (assignmentGrid[lIdx] === 0 && isOcean[lIdx] === 0) {
        isOcean[lIdx] = 1;
        oceanQueue[qTail++] = lIdx;
      }
      const rIdx = y * width + (width - 1);
      if (assignmentGrid[rIdx] === 0 && isOcean[rIdx] === 0) {
        isOcean[rIdx] = 1;
        oceanQueue[qTail++] = rIdx;
      }
    }

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    while (qHead < qTail) {
      const currIdx = oceanQueue[qHead++]!;
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);

      for (let d = 0; d < 4; d++) {
        const dir = dirs[d]!;
        const nx = (cx + dir.dx + width) % width;
        const ny = cy + dir.dy;

        if (ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (assignmentGrid[nIdx] === 0 && isOcean[nIdx] === 0) {
            isOcean[nIdx] = 1;
            oceanQueue[qTail++] = nIdx;
          }
        }
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      if (assignmentGrid[i] === 0) {
        const x = i % width;
        const y = Math.floor(i / width);
        if (isOcean[i] === 1) {
          bitBuffer.setPixel(x, y, BitPackedCellUtility.WATER_OCEAN_ID);
        } else {
          assignmentGrid[i] = BitPackedCellUtility.WATER_LAKE_ID;
          bitBuffer.setPixel(x, y, BitPackedCellUtility.WATER_LAKE_ID);
        }
      }
    }
  }
}
