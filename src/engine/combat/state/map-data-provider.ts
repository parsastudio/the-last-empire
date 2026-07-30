import fs from "fs/promises";
import path from "path";
import { MapPathResolver } from "@/application/map-rendering/map-path-resolver";

let cached1024Buffer: Uint8Array | null = null;
let cachedRawBuffer: Uint8Array | null = null;
let cachedMode: string | null = null;

export class MapDataProvider {
  public async loadRawMaskBuffer(
    mapMode = "partition",
  ): Promise<Uint8Array | null> {
    if (cachedRawBuffer && cachedMode === mapMode) {
      return cachedRawBuffer;
    }

    try {
      const targetDir = MapPathResolver.getMapServerDir("map1", mapMode);
      let filename = "partition-mask.bin";
      if (mapMode === "edited") filename = "edited-mask.bin";
      if (mapMode === "default") filename = "default-mask.bin";

      const maskPath = path.join(targetDir, filename);
      const buffer = await fs.readFile(maskPath);
      cachedRawBuffer = new Uint8Array(buffer);
      cachedMode = mapMode;
      return cachedRawBuffer;
    } catch {
      return null;
    }
  }

  public async load1024PackedBuffer(
    mapMode = "partition",
  ): Promise<Uint8Array | null> {
    if (cached1024Buffer && cachedMode === mapMode) {
      return cached1024Buffer;
    }

    try {
      const targetDir = MapPathResolver.getMapServerDir("map1", mapMode);
      let filename = "partition-mask-1024.bin";
      if (mapMode === "edited") filename = "edited-mask-1024.bin";
      if (mapMode === "default") filename = "default-mask-1024.bin";

      const maskPath = path.join(targetDir, filename);
      const buffer = await fs.readFile(maskPath);
      cached1024Buffer = new Uint8Array(buffer);
      cachedMode = mapMode;
      return cached1024Buffer;
    } catch {
      return null;
    }
  }

  public clearCache(): void {
    cached1024Buffer = null;
    cachedRawBuffer = null;
    cachedMode = null;
  }
}
