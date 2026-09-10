import { BitPackedBuffer } from "@geopolitics/domain";
import { BinaryFileExportHelper } from "@/infrastructure/core/io/binary-file-export-helper";

export class BinaryStateExporter {
  public static async exportLiveState(
    bitBuffer: BitPackedBuffer,
    outputDir: string,
  ): Promise<void> {
    await BinaryFileExportHelper.exportRawAndGzip(
      outputDir,
      "live-state.bin",
      bitBuffer.toUint8ArrayBuffer(),
    );
  }
}
