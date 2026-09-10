import path from "path";
import { TerrainBinaryBuilder } from "@/infrastructure/visual-pipeline/compression/terrain-binary-builder";
import { TerrainBinarySerializer } from "@/infrastructure/visual-pipeline/compression/terrain-binary-serializer";
import { BinaryFileExportHelper } from "@/infrastructure/core/io/binary-file-export-helper";

export class TerrainBinaryExportService {
  public static async generateAndExportFromRgba(
    rgbaData: Uint8Array,
    width: number,
    height: number,
    outputDir: string,
  ): Promise<string> {
    const built = TerrainBinaryBuilder.buildFromRgba(rgbaData, width, height);
    const rawBuffer = TerrainBinarySerializer.serializeRaw(
      built,
      width,
      height,
    );

    const { rawPath } = await BinaryFileExportHelper.exportRawAndGzip(
      outputDir,
      "terrain-raw.bin",
      rawBuffer,
    );

    return rawPath;
  }
}
