import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class ProvinceNeighborDetector {
  public static detect(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const raw = bitBuffer.getRawBuffer();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const p1 = raw[idx]! & 0x0fff;

        if (p1 < BitPackedCellUtility.FIRST_PROVINCE_ID) continue;

        const info1 = provinceMap.get(p1);

        if (x + 1 < width) {
          const p2 = raw[idx + 1]! & 0x0fff;
          if (p2 === BitPackedCellUtility.WATER_OCEAN_ID && info1) {
            info1.hasSeaAccess = true;
          } else if (
            p2 >= BitPackedCellUtility.FIRST_PROVINCE_ID &&
            p2 !== p1
          ) {
            const info2 = provinceMap.get(p2);
            if (info1) info1.landNeighbors.add(p2);
            if (info2) info2.landNeighbors.add(p1);
          }
        }

        if (y + 1 < height) {
          const p3 = raw[idx + width]! & 0x0fff;
          if (p3 === BitPackedCellUtility.WATER_OCEAN_ID && info1) {
            info1.hasSeaAccess = true;
          } else if (
            p3 >= BitPackedCellUtility.FIRST_PROVINCE_ID &&
            p3 !== p1
          ) {
            const info3 = provinceMap.get(p3);
            if (info1) info1.landNeighbors.add(p3);
            if (info3) info3.landNeighbors.add(p1);
          }
        }
      }
    }
  }
}
