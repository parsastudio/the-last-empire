import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(zlib.gzip);

export class BinaryFileExportHelper {
  public static async exportRawAndGzip(
    outputDir: string,
    rawFilename: string,
    data: Uint8Array | ArrayBuffer,
  ): Promise<{ rawPath: string; gzPath: string }> {
    await fs.mkdir(outputDir, { recursive: true });
    const rawPath = path.join(outputDir, rawFilename);
    const gzPath = path.join(outputDir, `${rawFilename}.gz`);
    const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);

    await fs.writeFile(rawPath, uint8);
    const compressed = await gzipAsync(uint8, {
      level: zlib.constants.Z_BEST_COMPRESSION,
    });
    await fs.writeFile(gzPath, compressed);

    return { rawPath, gzPath };
  }
}
