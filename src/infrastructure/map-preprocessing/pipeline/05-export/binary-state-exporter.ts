import fs from "fs/promises";
import path from "path";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";

export class BinaryStateExporter {
  public static async exportLiveState(
    bitBuffer: BitPackedBuffer,
    outputDir: string,
  ): Promise<void> {
    const binPath = path.join(outputDir, "live-state.bin");
    const uint8Buf = bitBuffer.toUint8ArrayBuffer();
    await fs.writeFile(binPath, uint8Buf);
  }
}
