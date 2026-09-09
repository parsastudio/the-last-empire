import fs from "fs/promises";
import path from "path";
import { TerrainBinaryBuilder } from "./terrain-binary-builder";
import { TerrainBinarySerializer } from "./terrain-binary-serializer";

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
    await fs.writeFile(rawOutputPath, rawBuffer);
    return rawOutputPath;
  }
}
