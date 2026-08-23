import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { promisify } from "util";
import { TerrainBinaryBuilder } from "@/infrastructure/visual-pipeline/compression/terrain-binary-builder";
import { TerrainBinarySerializer } from "@/infrastructure/visual-pipeline/compression/terrain-binary-serializer";
import { TerrainBinaryReader } from "@/infrastructure/visual-pipeline/compression/terrain-binary-reader";
import {
  BuiltTerrainSpans,
  TerrainBinaryBuildStats,
} from "@/infrastructure/visual-pipeline/compression/terrain-binary-types";

const gzipAsync = promisify(zlib.gzip);

export class TerrainBinaryExportService {
  public static async generateAndExport(
    gridData: Uint8Array,
    width: number,
    height: number,
    outputDir: string,
  ): Promise<TerrainBinaryBuildStats> {
    if (gridData.byteLength === width * height * 4) {
      return this.generateAndExportFromRgba(gridData, width, height, outputDir);
    }
    return this.generateAndExportFromIndexed(
      gridData,
      width,
      height,
      outputDir,
    );
  }

  public static async generateAndExportFromIndexed(
    indexedData: Uint8Array,
    width: number,
    height: number,
    outputDir: string,
  ): Promise<TerrainBinaryBuildStats> {
    const built = TerrainBinaryBuilder.buildFromIndexedGrid(
      indexedData,
      width,
      height,
    );
    return this.saveAndVerify(built, width, height, outputDir);
  }

  public static async generateAndExportFromRgba(
    rgbaData: Uint8Array,
    width: number,
    height: number,
    outputDir: string,
  ): Promise<TerrainBinaryBuildStats> {
    const built = TerrainBinaryBuilder.buildFromRgba(rgbaData, width, height);
    return this.saveAndVerify(built, width, height, outputDir);
  }

  private static async saveAndVerify(
    built: BuiltTerrainSpans,
    width: number,
    height: number,
    outputDir: string,
  ): Promise<TerrainBinaryBuildStats> {
    const rawBuffer = TerrainBinarySerializer.serializeRaw(
      built,
      width,
      height,
    );
    const rawOutputPath = path.join(outputDir, "terrain-raw.bin");
    await fs.writeFile(rawOutputPath, rawBuffer);

    const compressedBuffer = TerrainBinarySerializer.serializeCompressed(
      built,
      width,
      height,
    );
    const compressedOutputPath = path.join(outputDir, "terrain-compressed.bin");
    await fs.writeFile(compressedOutputPath, compressedBuffer);

    const gzippedBuffer = await gzipAsync(compressedBuffer, {
      level: zlib.constants.Z_BEST_COMPRESSION,
    });
    const gzippedOutputPath = path.join(outputDir, "terrain-compressed.bin.gz");
    await fs.writeFile(gzippedOutputPath, gzippedBuffer);

    const reader = new TerrainBinaryReader(compressedBuffer);
    const unpacked = reader.unpackToRawBuffer();

    const totalPixels = width * height;
    let mismatchCount = 0;
    for (let i = 0; i < totalPixels; i++) {
      if (unpacked[i] !== built.rawIndexedGrid[i]) {
        mismatchCount++;
      }
    }

    const uncompressedRgbaSize = totalPixels * 4;
    const rawSize = rawBuffer.byteLength;
    const compressedSize = compressedBuffer.byteLength;
    const gzippedSize = gzippedBuffer.byteLength;

    const rawSavings = Number(
      (
        ((uncompressedRgbaSize - rawSize) / (uncompressedRgbaSize || 1)) *
        100
      ).toFixed(2),
    );
    const compressedSavings = Number(
      (
        ((uncompressedRgbaSize - compressedSize) /
          (uncompressedRgbaSize || 1)) *
        100
      ).toFixed(2),
    );
    const gzippedSavings = Number(
      (
        ((uncompressedRgbaSize - gzippedSize) / (uncompressedRgbaSize || 1)) *
        100
      ).toFixed(2),
    );

    const stats: TerrainBinaryBuildStats = {
      pngSizeBytes: uncompressedRgbaSize,
      rawBinarySizeBytes: rawSize,
      compressedBinarySizeBytes: compressedSize,
      gzippedBinarySizeBytes: gzippedSize,
      rawSavingsPercent: rawSavings,
      compressedSavingsPercent: compressedSavings,
      gzippedSavingsPercent: gzippedSavings,
      totalPaletteColors: built.palette.length,
      totalSpansCount: built.totalSpans,
      avgSpansPerRow: Number((built.totalSpans / height).toFixed(2)),
      totalPixelsVerified: totalPixels,
      mismatchCount,
      isLosslessMatch: mismatchCount === 0,
    };

    const statsPath = path.join(outputDir, "terrain-binary-stats.json");
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), "utf-8");

    return stats;
  }
}
