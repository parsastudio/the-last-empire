import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";
import { BitPackedBuffer } from "@geopolitics/domain";
import { BinaryFileExportHelper } from "@/infrastructure/core/io/binary-file-export-helper";

const gzipAsync = promisify(zlib.gzip);

export class BinaryStateExporter {
  public static async exportLiveState(
    bitBuffer: BitPackedBuffer,
    outputDir: string,
    finalDir?: string,
  ): Promise<void> {
    const data = bitBuffer.toUint8ArrayBuffer();
    await BinaryFileExportHelper.exportRawAndGzip(
      outputDir,
      "live-state.bin",
      data,
    );

    if (finalDir) {
      await fs.mkdir(finalDir, { recursive: true });
      const gzPath = path.join(finalDir, "live-state.bin.gz");
      const compressed = await gzipAsync(data, {
        level: zlib.constants.Z_BEST_COMPRESSION,
      });
      await fs.writeFile(gzPath, compressed);
    }
  }
}
