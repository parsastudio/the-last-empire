import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class BitPackedProvinceConqueror {
  public static conquerProvince(
    buffer: BitPackedBuffer,
    targetProvinceId: number,
    newOwnerNumericId: number,
  ): number {
    const raw = buffer.getRawBuffer();
    const len = raw.length;
    let pixelCount = 0;

    for (let i = 0; i < len; i++) {
      const packed = raw[i]!;
      const pid = BitPackedCellUtility.getProvinceId(packed);
      if (pid === targetProvinceId) {
        raw[i] = BitPackedCellUtility.setNationId(packed, newOwnerNumericId);
        pixelCount++;
      }
    }

    return pixelCount;
  }
}
