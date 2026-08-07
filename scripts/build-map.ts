import path from "path";
import { MapBuildOrchestrator } from "@/infrastructure/map-preprocessing/final/map-build-orchestrator";

async function main() {
  const orchestrator = new MapBuildOrchestrator();
  const maskPath = path.join(
    process.cwd(),
    "public",
    "maps",
    "map1",
    "essential",
    "edited-mask.png",
  );
  const outputDir = path.join(
    process.cwd(),
    "public",
    "maps",
    "map1",
    "temp",
    "final",
  );

  await orchestrator.executeRebuild(maskPath, outputDir, "map1");
}

main().catch(() => {
  process.exit(1);
});
