import { MapBuildOrchestrator } from "@/infrastructure/map-preprocessing/final/map-build-orchestrator";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

async function runMapBuild(): Promise<void> {
  console.log("=== شروع فرآیند پردازش و ساخت نقشه ===");

  try {
    const maskPath = MapPathResolver.getEditedMaskServerPath();
    const outputDir = MapPathResolver.getMapFinalServerDir("map1");

    console.log("مسیر فایل ماسک:", maskPath);
    console.log("مسیر پوشه خروجی:", outputDir);

    const orchestrator = new MapBuildOrchestrator();
    await orchestrator.executeRebuild(maskPath, outputDir, "map1");

    console.log("=== ساخت نقشه با موفقیت کامل انجام شد ===");
  } catch (error) {
    console.error("=== خطای بحرانی در ساخت نقشه ===");
    console.error(error);
    process.exit(1);
  }
}

runMapBuild();
