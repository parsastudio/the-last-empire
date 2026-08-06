import "server-only";
import fs from "fs/promises";
import path from "path";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class ServerFinalStateLoader {
  public static async loadLiveStateBuffer(
    mapId = "map1",
  ): Promise<BitPackedBuffer | null> {
    try {
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
      return bitBuffer;
    } catch {
      return null;
    }
  }
}
