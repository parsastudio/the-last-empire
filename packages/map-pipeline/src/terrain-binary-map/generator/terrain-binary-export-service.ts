import fs from "fs/promises";
import path from "path";
import { TerrainBinaryBuilder } from "@/infrastructure/terrain-binary-map/builder/terrain-binary-builder";
import { TerrainBinarySerializer } from "@/infrastructure/terrain-binary-map/serializer/terrain-binary-serializer";
import { TerrainBinaryReader } from "@/infrastructure/terrain-binary-map/runtime/terrain-binary-reader";
import { TerrainBinaryBuildStats } from "@/infrastructure/terrain-binary-map/core/terrain-binary-types";

export class TerrainBinaryExportService {
  public static async generateAndExport(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    outputDir: string,
    pngFilePath: string,
  ): Promise<TerrainBinaryBuildStats> {
    const built = TerrainBinaryBuilder.build(assignmentGrid, width, height);

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

    let pngSize = 0;
    try {
      const pngStat = await fs.stat(pngFilePath);
      pngSize = pngStat.size;
    } catch {
      pngSize = width * height * 4;
    }

    const reader = new TerrainBinaryReader(compressedBuffer);
    const unpacked = reader.unpackToRawBuffer();

    let mismatchCount = 0;
    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      if (unpacked[i] !== built.rawIndexedGrid[i]) {
        mismatchCount++;
      }
    }

    const rawSize = rawBuffer.byteLength;
    const compressedSize = compressedBuffer.byteLength;

    const rawSavings = Number(
      (((pngSize - rawSize) / (pngSize || 1)) * 100).toFixed(2),
    );
    const compressedSavings = Number(
      (((pngSize - compressedSize) / (pngSize || 1)) * 100).toFixed(2),
    );

    const stats: TerrainBinaryBuildStats = {
      pngSizeBytes: pngSize,
      rawBinarySizeBytes: rawSize,
      compressedBinarySizeBytes: compressedSize,
      rawSavingsPercent: rawSavings,
      compressedSavingsPercent: compressedSavings,
      totalPaletteColors: built.palette.length,
      totalSpansCount: built.totalSpans,
      avgSpansPerRow: Number((built.totalSpans / height).toFixed(2)),
      totalPixelsVerified: totalPixels,
      mismatchCount,
      isLosslessMatch: mismatchCount === 0,
    };

    const statsPath = path.join(outputDir, "terrain-binary-stats.json");
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), "utf-8");

    this.logConsoleReport(stats);
    return stats;
  }

  private static logConsoleReport(stats: TerrainBinaryBuildStats): void {
    const pngKb = (stats.pngSizeBytes / 1024).toFixed(1);
    const rawKb = (stats.rawBinarySizeBytes / 1024).toFixed(1);
    const compKb = (stats.compressedBinarySizeBytes / 1024).toFixed(1);

    process.stdout.write(
      "\n==================================================\n",
    );
    process.stdout.write(
      "       گزارش بهینه‌سازی فایل‌های باینری ترِین      \n",
    );
    process.stdout.write(
      "==================================================\n",
    );
    process.stdout.write(`حجم تصویر مرجع PNG:              ${pngKb} KB\n`);
    process.stdout.write(`حجم فایل باینری خام (terrain-raw):  ${rawKb} KB\n`);
    process.stdout.write(`حجم فایل فشرده سطری (terrain-comp): ${compKb} KB\n`);
    process.stdout.write(
      "--------------------------------------------------\n",
    );
    process.stdout.write(
      `درصد کاهش حجم نهایی نسبت به PNG:  ${stats.compressedSavingsPercent}%\n`,
    );
    process.stdout.write(
      `تعداد کل رنگ‌های منحصربه‌فرد پالت:   ${stats.totalPaletteColors}\n`,
    );
    process.stdout.write(
      `تعداد کل بازه‌های سطری (Spans):     ${stats.totalSpansCount}\n`,
    );
    process.stdout.write(
      `میانگین بازه در هر سطر نقشه:       ${stats.avgSpansPerRow}\n`,
    );
    process.stdout.write(
      `تعداد خطاهای تطبیق پیکسلی:        ${stats.mismatchCount}\n`,
    );
    process.stdout.write(
      `وضعیت تطبیق ۱۰۰٪ بدون اتلاف:       ${stats.isLosslessMatch ? "تایید شد (LOSSLESS OK)" : "خطا در تطبیق"}\n`,
    );
    process.stdout.write(
      "==================================================\n\n",
    );
  }
}
