import { MapBuildOrchestrator } from "@/infrastructure/map-preprocessing/orchestrator/map-build-orchestrator";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server/server-map-path-resolver";

async function runMapBuild() {
  const mapId = "map1";
  const maskPath = ServerMapPathResolver.getEditedMaskServerPath(mapId);
  const outputDir = ServerMapPathResolver.getMapFinalServerDir(mapId);

  const orchestrator = new MapBuildOrchestrator();
  await orchestrator.executeRebuild(maskPath, outputDir, mapId);
}

runMapBuild().catch((error: unknown) => {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown build error";
  process.stderr.write(`Map build failed: ${errorMessage}\n`);
  process.exit(1);
});
