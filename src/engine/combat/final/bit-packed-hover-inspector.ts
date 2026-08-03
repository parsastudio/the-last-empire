import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export interface HoverInspectionResult {
  mapX: number;
  mapY: number;
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
    const nationId = buffer.getNationId(mapX, mapY);

    if (nationId < 11 || nationId >= 250) {
      return null;
    }

    const enclaveId = buffer.getEnclaveId(mapX, mapY);
    const frontier = buffer.getFrontier(mapX, mapY);
    const coastalAccess = buffer.getCoastalAccess(mapX, mapY);

    return {
      mapX,
      mapY,
      nationId,
      enclaveId,
      isFrontier: frontier === 1,
      coastalAccess,
      rawPackedValue: rawValue,
    };
  }
}
