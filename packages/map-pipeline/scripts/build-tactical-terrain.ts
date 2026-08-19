import path from "path";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server/server-map-path-resolver";
import { TacticalTerrainExporter } from "@/infrastructure/tactical-terrain-enhancer/exporter/tactical-terrain-exporter";

async function main() {
  const mapId = "map1";
  const sourceMaskPath = ServerMapPathResolver.getEditedMaskServerPath(mapId);
  const finalDir = ServerMapPathResolver.getMapFinalServerDir(mapId);
  const outputTacticalTerrain = path.join(finalDir, "tactical_map_terrain.png");

  process.stdout.write(
    "در حال پردازش و تولید نقشه تاکتیکی مستقیماً از فایل ماسک اولیه (Source Mask)...\n",
  );

  const stats = await TacticalTerrainExporter.buildDirectlyFromMask(
    sourceMaskPath,
    outputTacticalTerrain,
  );

  const sizeMb = (stats.outputSizeBytes / (1024 * 1024)).toFixed(2);
  const durationSec = (stats.executionTimeMs / 1000).toFixed(2);

  process.stdout.write("----------------------------------------\n");
  process.stdout.write(`ابعاد نقشه: ${stats.width}x${stats.height}\n`);
  process.stdout.write(`حجم فایل خروجی: ${sizeMb} MB\n`);
  process.stdout.write(`زمان اجرای پردازش: ${durationSec} ثانیه\n`);
  process.stdout.write(`منبع ورودی: ${sourceMaskPath}\n`);
  process.stdout.write(`مسیر ذخیره‌سازی: ${outputTacticalTerrain}\n`);
  process.stdout.write("تولید نقشه تاکتیکی با موفقیت انجام شد (SUCCESS).\n");
  process.stdout.write("----------------------------------------\n");
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : "Unknown error";
  process.stderr.write(`Tactical terrain build failed: ${msg}\n`);
  process.exit(1);
});
