import { RowSpansExportService } from "@/infrastructure/experiments/spatial-indexing/row-spans/row-spans-export-service";

async function main() {
  process.stdout.write("در حال پردازش و ارزیابی تطبیق پیکسلی نقشه سطری...\n");
  const result = await RowSpansExportService.generateFromLiveState("map1");

  const originalKb = (result.stats.originalSizeBytes / 1024).toFixed(1);
  const compressedKb = (result.stats.compressedSizeBytes / 1024).toFixed(1);

  process.stdout.write("----------------------------------------\n");
  process.stdout.write(`حجم اولیه: ${originalKb} KB\n`);
  process.stdout.write(`حجم فشرده سطری: ${compressedKb} KB\n`);
  process.stdout.write(
    `درصد فشرده‌سازی: ${result.stats.compressionRatioPercent}%\n`,
  );
  process.stdout.write(`تعداد کل بازه‌ها: ${result.stats.totalSpansCount}\n`);
  process.stdout.write(
    `میانگین بازه در هر سطر: ${result.stats.avgSpansPerRow}\n`,
  );
  process.stdout.write(
    `تعداد پیکسل بررسی‌شده: ${result.totalPixelsVerified.toLocaleString("fa-IR")}\n`,
  );
  process.stdout.write(`تعداد خطای عدم تطبیق: ${result.mismatchCount}\n`);
  process.stdout.write(
    `وضعیت تطبیق ۱۰۰٪: ${result.verificationPassed ? "موفق" : "ناموفق"}\n`,
  );
  process.stdout.write("----------------------------------------\n");
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : "Unknown error";
  process.stderr.write(`Build failed: ${msg}\n`);
  process.exit(1);
});
