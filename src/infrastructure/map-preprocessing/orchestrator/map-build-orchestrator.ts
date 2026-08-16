import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { PNG } from "pngjs";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";
import { MaskPixelDecoder } from "@/infrastructure/map-preprocessing/pipeline/01-ingestion/mask-pixel-decoder";
import { LandWatershedFlood } from "@/infrastructure/map-preprocessing/pipeline/01-ingestion/land-watershed-flood";
import { IslandTerritoryResolver } from "@/infrastructure/map-preprocessing/pipeline/01-ingestion/island-territory-resolver";
import { WaterBodyClassifier } from "@/infrastructure/map-preprocessing/pipeline/01-ingestion/water-body-classifier";
import { ProvincePartitionEngine } from "@/infrastructure/map-preprocessing/orchestrator/province-partition-engine";
import { BinaryStateExporter } from "@/infrastructure/map-preprocessing/pipeline/05-export/binary-state-exporter";
import { StrategicManifestBuilder } from "@/infrastructure/map-preprocessing/pipeline/05-export/strategic-manifest-builder";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server/server-map-path-resolver";

export class MapBuildOrchestrator {
  private manifestBuilder = new StrategicManifestBuilder();

  public async cleanOutputDirectory(targetDir: string): Promise<void> {
    await fs.mkdir(targetDir, { recursive: true });
    const files = ["manifest.json", "live-state.bin", "base_map_terrain.png"];
    for (const file of files) {
      const filePath = path.join(targetDir, file);
      try {
        await fs.unlink(filePath);
      } catch {}
    }
  }

  public async executeRebuild(
    maskPngPath: string,
    outputDir: string,
    mapId = "map1",
  ): Promise<void> {
    await this.cleanOutputDirectory(outputDir);

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
      if (profile.id && profile.id >= 11 && profile.id < 250) {
        validNationIds.add(profile.id);
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

    await BinaryStateExporter.exportLiveState(bitBuffer, outputDir);
    await this.manifestBuilder.buildAndSave(mapId, provinceMap, width, height);

    const terrainPath = ServerMapPathResolver.getTerrainServerPath(mapId);
    if (terrainPath && fsSync.existsSync(terrainPath)) {
      const destTerrainPath = path.join(outputDir, "base_map_terrain.png");
      await fs.copyFile(terrainPath, destTerrainPath);
    }
  }
}
