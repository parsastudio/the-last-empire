import { MapBuildOrchestrator } from "@/infrastructure/map-preprocessing/final/map-build-orchestrator";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server-map-path-resolver";

async function runMapBuild() {
  console.log("=== شروع فرآیند پردازش و ساخت نقشه ===");
  const mapId = "map1";
  const maskPath = ServerMapPathResolver.getEditedMaskServerPath(mapId);
  const outputDir = ServerMapPathResolver.getMapFinalServerDir(mapId);

  console.log(`مسیر فایل ماسک: ${maskPath}`);
  console.log(`مسیر پوشه خروجی: ${outputDir}`);

  const orchestrator = new MapBuildOrchestrator();
  await orchestrator.executeRebuild(maskPath, outputDir, mapId);
}

runMapBuild().catch((err) => {
  console.error("=== خطای بحرانی در ساخت نقشه ===", err);
  process.exit(1);
});
