import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class ClientFinalStateLoader {
  private static cachedBuffer: BitPackedBuffer | null = null;

  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    if (this.cachedBuffer) {
      return this.cachedBuffer;
    }

    try {
      const url = MapPathResolver.getMapFinalClientUrl(mapId, "live-state.bin");
      const res = await fetch(url);

      if (!res.ok) {
        return null;
      }

      const arrayBuf = await res.arrayBuffer();
      const bitBuffer = new BitPackedBuffer(
        MAP_CONFIG.HIGH_RES_WIDTH,
        MAP_CONFIG.HIGH_RES_HEIGHT,
      );
      bitBuffer.loadArrayBuffer(arrayBuf);

      this.cachedBuffer = bitBuffer;
      return this.cachedBuffer;
    } catch {
      return null;
    }
  }

  public static clearCache(): void {
    this.cachedBuffer = null;
  }
}
