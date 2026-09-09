import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";
import { TerrainBinaryBuilder } from "@/infrastructure/visual-pipeline/compression/terrain-binary-builder";
import { TerrainBinarySerializer } from "@/infrastructure/visual-pipeline/compression/terrain-binary-serializer";

const gzipAsync = promisify(zlib.gzip);

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
    const rawOutputPath = path.join(outputDir, "terrain-raw.bin");
    const gzOutputPath = path.join(outputDir, "terrain-raw.bin.gz");

    await fs.writeFile(rawOutputPath, rawBuffer);

    const compressed = await gzipAsync(rawBuffer, {
      level: zlib.constants.Z_BEST_COMPRESSION,
    });
    await fs.writeFile(gzOutputPath, compressed);

    return rawOutputPath;
  }
}
