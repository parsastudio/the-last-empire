import { BitPackedBuffer } from "@/domain/map/bit-packed-buffer";
import { Province } from "@/domain/province/province.schema";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class ProvincePixelCalculator {
  public static calculateExactPixelCounts(
    buffer: BitPackedBuffer,
  ): Map<number, number> {
    const raw = buffer.getRawBuffer();
    const counts = new Map<number, number>();
    const len = raw.length;

    for (let i = 0; i < len; i++) {
      const pid = BitPackedCellUtility.getProvinceId(raw[i]!);
      if (pid > 0) {
        counts.set(pid, (counts.get(pid) || 0) + 1);
      }
    }

    return counts;
  }

  public static syncProvincesMapPixelCounts(
    buffer: BitPackedBuffer,
    provincesMap?: Record<string, Province>,
  ): Record<string, Province> {
    if (!provincesMap || Object.keys(provincesMap).length === 0) {
      return provincesMap || {};
    }

    const counts = this.calculateExactPixelCounts(buffer);
    let hasChanges = false;
    const updatedMap: Record<string, Province> = { ...provincesMap };

    for (const prov of Object.values(provincesMap)) {
      const realCount = counts.get(prov.provinceId) || prov.pixelCount || 0;
      if (prov.pixelCount !== realCount) {
        hasChanges = true;
        updatedMap[prov.provinceId.toString()] = {
          ...prov,
          pixelCount: realCount,
        };
      }
    }

    return hasChanges ? updatedMap : provincesMap;
  }
}
