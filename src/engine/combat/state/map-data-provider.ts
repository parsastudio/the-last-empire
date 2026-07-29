import fs from "fs/promises";
import path from "path";

export class MapDataProvider {
  public async loadRawMaskBuffer(): Promise<Uint8Array | null> {
    try {
      const publicDir = path.join(process.cwd(), "public");
      try {
        const maskPath = path.join(
          publicDir,
          "maps",
          "map1",
          "partition-mask.bin",
        );
        const buffer = await fs.readFile(maskPath);
        return new Uint8Array(buffer);
      } catch {
        try {
          const maskPath = path.join(
            publicDir,
            "maps",
            "map1",
            "edited-mask.bin",
          );
          const buffer = await fs.readFile(maskPath);
          return new Uint8Array(buffer);
        } catch {
          const maskPath = path.join(
            publicDir,
            "maps",
            "map1",
            "default-mask.bin",
          );
          const buffer = await fs.readFile(maskPath);
          return new Uint8Array(buffer);
        }
      }
    } catch {
      return null;
    }
  }

  public async load1024PackedBuffer(): Promise<Uint8Array | null> {
    try {
      const publicDir = path.join(process.cwd(), "public");
      try {
        const maskPath = path.join(
          publicDir,
          "maps",
          "map1",
          "partition-mask-1024.bin",
        );
        const buffer = await fs.readFile(maskPath);
        return new Uint8Array(buffer);
      } catch {
        try {
          const maskPath = path.join(
            publicDir,
            "maps",
            "map1",
            "edited-mask-1024.bin",
          );
          const buffer = await fs.readFile(maskPath);
          return new Uint8Array(buffer);
        } catch {
          const maskPath = path.join(
            publicDir,
            "maps",
            "map1",
            "default-mask-1024.bin",
          );
          const buffer = await fs.readFile(maskPath);
          return new Uint8Array(buffer);
        }
      }
    } catch {
      return null;
    }
  }
}
