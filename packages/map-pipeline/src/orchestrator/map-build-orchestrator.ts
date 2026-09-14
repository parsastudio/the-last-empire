import fs from "fs/promises";
import path from "path";
import { PNG } from "pngjs";
import {
  ALL_COUNTRY_PROFILES,
  BitPackedBuffer,
  CountryRegistry,
} from "@geopolitics/domain";
import { MaskPixelDecoder } from "@/infrastructure/strategic-pipeline/01-ingestion/mask-pixel-decoder";
import { LandWatershedFlood } from "@/infrastructure/strategic-pipeline/01-ingestion/land-watershed-flood";
import { IslandTerritoryResolver } from "@/infrastructure/strategic-pipeline/01-ingestion/island-territory-resolver";
import { WaterBodyClassifier } from "@/infrastructure/strategic-pipeline/01-ingestion/water-body-classifier";
import { ProvincePartitionEngine } from "@/infrastructure/orchestrator/province-partition-engine";
import { BinaryStateExporter } from "@/infrastructure/orchestrator/binary-state-exporter";
import { StrategicManifestBuilder } from "@/infrastructure/orchestrator/strategic-manifest-builder";
import { TacticalTerrainExporter } from "@/infrastructure/visual-pipeline/exporters/tactical-terrain-exporter";
import { MaritimeEnricherEngine } from "@/infrastructure/strategic-pipeline/05-maritime-network/orchestrator/maritime-enricher-engine";
import { ServerMapPathResolver } from "@/infrastructure/core/io/server-map-path-resolver";

export class MapBuildOrchestrator {
  private manifestBuilder = new StrategicManifestBuilder();

  public async cleanOutputDirectory(mapId = "map1"): Promise<void> {
    const strategicDir = ServerMapPathResolver.getMapStrategicServerDir(mapId);
    const visualDir = ServerMapPathResolver.getMapVisualServerDir(mapId);
    const finalDir = ServerMapPathResolver.getMapFinalServerDir(mapId);

    const strategicFiles = [
      "manifest.json",
      "live-state.bin",
      "live-state.bin.gz",
    ];

    const visualFiles = [
      "tactical_map_terrain.png",
      "terrain-raw.bin",
      "terrain-raw.bin.gz",
      "terrain-compressed.bin",
      "terrain-compressed.bin.gz",
      "terrain-binary-stats.json",
    ];

    const finalFiles = [
      "manifest.json",
      "live-state.bin",
      "live-state.bin.gz",
      "terrain-raw.bin",
      "terrain-raw.bin.gz",
    ];

    for (const file of strategicFiles) {
      try {
        await fs.unlink(path.join(strategicDir, file));
      } catch {}
    }

    for (const file of visualFiles) {
      try {
        await fs.unlink(path.join(visualDir, file));
      } catch {}
    }

    for (const file of finalFiles) {
      try {
        await fs.unlink(path.join(finalDir, file));
      } catch {}
    }
  }

  public async executeRebuild(
    maskPngPath: string,
    mapId = "map1",
  ): Promise<void> {
    await this.cleanOutputDirectory(mapId);

    const strategicDir = ServerMapPathResolver.getMapStrategicServerDir(mapId);
    const visualDir = ServerMapPathResolver.getMapVisualServerDir(mapId);
    const finalDir = ServerMapPathResolver.getMapFinalServerDir(mapId);

    const imageBuffer = await fs.readFile(maskPngPath);
    const png = await new Promise<PNG>((resolve, reject) => {
      new PNG().parse(imageBuffer, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const width = png.width;
    const height = png.height;
    const bitBuffer = new BitPackedBuffer(width, height);

    const rawNationGrid = MaskPixelDecoder.decodeNationGrid(png, width, height);

    const validNationIds = new Set<number>();
    for (const profile of ALL_COUNTRY_PROFILES) {
      const gpuIdx = CountryRegistry.getGpuColorIndex(profile.code);
      if (gpuIdx >= 11 && gpuIdx < 250) {
        validNationIds.add(gpuIdx);
      }
    }

    const assignmentGrid = LandWatershedFlood.flood(
      rawNationGrid,
      width,
      height,
      validNationIds,
    );

    IslandTerritoryResolver.processIsolatedIslands(
      assignmentGrid,
      width,
      height,
      validNationIds,
    );

    WaterBodyClassifier.classifyOceanAndLakes(
      assignmentGrid,
      width,
      height,
      bitBuffer,
    );

    const provinceMap = ProvincePartitionEngine.partitionProvinces(
      assignmentGrid,
      width,
      height,
      bitBuffer,
    );

    await BinaryStateExporter.exportLiveState(
      bitBuffer,
      strategicDir,
      finalDir,
    );
    await this.manifestBuilder.buildAndSave(mapId, provinceMap, width, height);

    const destTerrainPath = path.join(visualDir, "tactical_map_terrain.png");
    await TacticalTerrainExporter.buildDirectlyFromMask(
      maskPngPath,
      destTerrainPath,
    );

    const rawTerrainGzSrc = path.join(visualDir, "terrain-raw.bin.gz");
    const rawTerrainGzDest = path.join(finalDir, "terrain-raw.bin.gz");
    const rawTerrainSrc = path.join(visualDir, "terrain-raw.bin");
    const rawTerrainDest = path.join(finalDir, "terrain-raw.bin");

    try {
      await fs.copyFile(rawTerrainGzSrc, rawTerrainGzDest);
      await fs.copyFile(rawTerrainSrc, rawTerrainDest);
    } catch {}

    await MaritimeEnricherEngine.enrichManifestMaritimeTopology(mapId);

    const finalManifestSrc = path.join(strategicDir, "manifest.json");
    const finalManifestDest = path.join(finalDir, "manifest.json");
    try {
      await fs.copyFile(finalManifestSrc, finalManifestDest);
    } catch {}
  }
}
