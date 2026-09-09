import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";
import { BitPackedBuffer } from "@geopolitics/domain";

const gzipAsync = promisify(zlib.gzip);

export class BinaryStateExporter {
  public static async exportLiveState(
    bitBuffer: BitPackedBuffer,
    outputDir: string,
  ): Promise<void> {
    const binPath = path.join(outputDir, "live-state.bin");
    const gzPath = path.join(outputDir, "live-state.bin.gz");
    const uint8Buf = bitBuffer.toUint8ArrayBuffer();

    await fs.writeFile(binPath, uint8Buf);

    const compressed = await gzipAsync(uint8Buf, {
      level: zlib.constants.Z_BEST_COMPRESSION,
    });
    await fs.writeFile(gzPath, compressed);
  }
}
