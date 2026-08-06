import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class FinalStateLoader {
  private static cachedBuffer: BitPackedBuffer | null = null;

  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    if (this.cachedBuffer) {
      return this.cachedBuffer;
    }

    try {
      if (typeof window === "undefined") {
        const fs = await import("fs/promises");
        const path = await import("path");
        const finalDir = MapPathResolver.getMapFinalServerDir(mapId);
        const binPath = path.join(finalDir, "live-state.bin");
        const fileBuffer = await fs.readFile(binPath);

        const bitBuffer = new BitPackedBuffer(
          MAP_CONFIG.HIGH_RES_WIDTH,
          MAP_CONFIG.HIGH_RES_HEIGHT,
        );
        bitBuffer.loadArrayBuffer(
          fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength,
          ),
        );
        this.cachedBuffer = bitBuffer;
        return this.cachedBuffer;
      }

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
