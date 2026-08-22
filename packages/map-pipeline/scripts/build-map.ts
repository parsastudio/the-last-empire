import { MapBuildOrchestrator } from "@/infrastructure/map-preprocessing/orchestrator/map-build-orchestrator";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server/server-map-path-resolver";

async function runMapBuild() {
  process.stdout.write(
    "در حال پردازش و ساخت کامل نقشه، بافرها و توپولوژی دریایی...\n",
  );

  const mapId = "map1";
  const maskPath = ServerMapPathResolver.getEditedMaskServerPath(mapId);
  const outputDir = ServerMapPathResolver.getMapFinalServerDir(mapId);

  const orchestrator = new MapBuildOrchestrator();
  await orchestrator.executeRebuild(maskPath, outputDir, mapId);

  process.stdout.write("--------------------------------------------------\n");
  process.stdout.write(
    "فرآیند ساخت نقشه و توپولوژی دریایی با موفقیت کامل انجام شد.\n",
  );
  process.stdout.write("--------------------------------------------------\n");
}

runMapBuild().catch((error: unknown) => {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown build error";
  process.stderr.write(`Map build failed: ${errorMessage}\n`);
  process.exit(1);
});
