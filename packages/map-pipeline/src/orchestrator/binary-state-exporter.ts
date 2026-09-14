import { BitPackedBuffer } from "@geopolitics/domain";
import { BinaryFileExportHelper } from "@/infrastructure/core/io/binary-file-export-helper";

export class BinaryStateExporter {
  public static async exportLiveState(
    bitBuffer: BitPackedBuffer,
    outputDir: string,
    secondaryDir?: string,
  ): Promise<void> {
    const data = bitBuffer.toUint8ArrayBuffer();
    await BinaryFileExportHelper.exportRawAndGzip(
      outputDir,
      "live-state.bin",
      data,
    );

    if (secondaryDir) {
      await BinaryFileExportHelper.exportRawAndGzip(
        secondaryDir,
        "live-state.bin",
        data,
      );
    }
  }
}
