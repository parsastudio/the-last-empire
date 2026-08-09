import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export interface HoverInspectionResult {
  mapX: number;
  mapY: number;
  provinceId: number;
  nationId: number;
  enclaveId: number;
  isFrontier: boolean;
  coastalAccess: number;
  rawPackedValue: number;
}

export class BitPackedHoverInspector {
  public inspect(
    buffer: BitPackedBuffer,
    mapX: number,
    mapY: number,
  ): HoverInspectionResult | null {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    if (mapX < 0 || mapX >= width || mapY < 0 || mapY >= height) {
      return null;
    }

    const rawValue = buffer.getPixel(mapX, mapY);
    const provinceId = BitPackedCellUtility.getProvinceId(rawValue);

    if (provinceId <= 0) {
      return null;
    }

    return {
      mapX,
      mapY,
      provinceId,
      nationId: provinceId,
      enclaveId: 0,
      isFrontier: false,
      coastalAccess: 0,
      rawPackedValue: provinceId,
    };
  }
}
