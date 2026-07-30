import fs from "fs/promises";
import path from "path";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

let cached1024Buffer: Uint8Array | null = null;
let cached4KBuffer: Uint8Array | null = null;

export class MapDataProvider {
  public async loadRawMaskBuffer(): Promise<Uint8Array | null> {
    if (cached4KBuffer) {
      return cached4KBuffer;
    }

    try {
      const targetDir = MapPathResolver.getMapServerDir("map1");
      const maskPath = path.join(targetDir, "mask-4k.bin");
      const buffer = await fs.readFile(maskPath);
      cached4KBuffer = new Uint8Array(buffer);
      return cached4KBuffer;
    } catch {
      return null;
    }
  }

  public async load1024PackedBuffer(): Promise<Uint8Array | null> {
    if (cached1024Buffer) {
      return cached1024Buffer;
    }

    try {
      const targetDir = MapPathResolver.getMapServerDir("map1");
      const maskPath = path.join(targetDir, "mask-1024.bin");
      const buffer = await fs.readFile(maskPath);
      cached1024Buffer = new Uint8Array(buffer);
      return cached1024Buffer;
    } catch {
      return null;
    }
  }

  public clearCache(): void {
    cached1024Buffer = null;
    cached4KBuffer = null;
  }
}
