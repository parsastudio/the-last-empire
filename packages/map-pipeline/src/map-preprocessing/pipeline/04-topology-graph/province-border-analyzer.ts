import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";
import { ProvinceBounds } from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class ProvinceBorderAnalyzer {
  public static calculateAllBounds(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
  ): Map<number, ProvinceBounds> {
    const boundsMap = new Map<number, ProvinceBounds>();
    const raw = bitBuffer.getRawBuffer();
    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      const pid = raw[i]! & 0x0fff;
      if (pid < BitPackedCellUtility.FIRST_PROVINCE_ID) continue;

      const x = i % width;
      const y = Math.floor(i / width);
      const b = boundsMap.get(pid);

      if (!b) {
        boundsMap.set(pid, { minX: x, maxX: x, minY: y, maxY: y });
      } else {
        if (x < b.minX) b.minX = x;
        if (x > b.maxX) b.maxX = x;
        if (y < b.minY) b.minY = y;
        if (y > b.maxY) b.maxY = y;
      }
    }

    return boundsMap;
  }

  public static calculateSharedBorderLength(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    pidA: number,
    pidB: number,
    boundsA: ProvinceBounds,
  ): number {
    const raw = bitBuffer.getRawBuffer();
    let sharedCount = 0;

    const startY = Math.max(0, boundsA.minY - 1);
    const endY = Math.min(height - 1, boundsA.maxY + 1);
    const startX = Math.max(0, boundsA.minX - 1);
    const endX = Math.min(width - 1, boundsA.maxX + 1);

    for (let y = startY; y <= endY; y++) {
      const rowOffset = y * width;
      for (let x = startX; x <= endX; x++) {
        const idx = rowOffset + x;
        const currentPid = raw[idx]! & 0x0fff;

        if (currentPid === pidA) {
          if (x + 1 < width && (raw[idx + 1]! & 0x0fff) === pidB) sharedCount++;
          if (x - 1 >= 0 && (raw[idx - 1]! & 0x0fff) === pidB) sharedCount++;
          if (y + 1 < height && (raw[idx + width]! & 0x0fff) === pidB)
            sharedCount++;
          if (y - 1 >= 0 && (raw[idx - width]! & 0x0fff) === pidB)
            sharedCount++;
        }
      }
    }

    return sharedCount;
  }
}
