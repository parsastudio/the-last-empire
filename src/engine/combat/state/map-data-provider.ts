import fs from "fs/promises";
import path from "path";

export class MapDataProvider {
  public async loadRawMaskBuffer(): Promise<Uint8Array | null> {
    try {
      const publicDir = path.join(process.cwd(), "public");
      const maskPath = path.join(publicDir, "test6", "world-mask.png");
      const buffer = await fs.readFile(maskPath);
      return new Uint8Array(buffer);
    } catch {
      return null;
    }
  }

  public async load1024PackedBuffer(): Promise<Uint8Array | null> {
    try {
      const publicDir = path.join(process.cwd(), "public");
      const maskPath = path.join(publicDir, "test6", "world-mask-1024.bin");
      const buffer = await fs.readFile(maskPath);
      return new Uint8Array(buffer);
    } catch {
      return null;
    }
  }
}
