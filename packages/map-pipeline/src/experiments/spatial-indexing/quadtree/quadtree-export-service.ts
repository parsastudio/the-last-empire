import fs from "fs/promises";
import path from "path";
import { ServerMapPathResolver } from "@/infrastructure/core/io/server-map-path-resolver";
import { QuadtreeBuilder } from "./quadtree-builder";
import { QuadtreeSerializer } from "./quadtree-serializer";
import { QuadtreeReader } from "./quadtree-reader";
import { QuadtreeBuildStats } from "./quadtree-types";

export class QuadtreeExportService {
  public static async generateFromLiveState(
    mapId = "map1",
  ): Promise<{ stats: QuadtreeBuildStats; verificationPassed: boolean }> {
    const strategicDir = ServerMapPathResolver.getMapStrategicServerDir(mapId);
    const liveStatePath = path.join(strategicDir, "live-state.bin");

    const rawBuffer = await fs.readFile(liveStatePath);
    const uint16Data = new Uint16Array(
      rawBuffer.buffer,
      rawBuffer.byteOffset,
      rawBuffer.byteLength / 2,
    );

    const mapWidth = 4096;
    const mapHeight = 2048;
    const hemisphereSize = 2048;

    const rootWest = QuadtreeBuilder.buildHemisphereTree(
      uint16Data,
      mapWidth,
      mapHeight,
      0,
      0,
      hemisphereSize,
    );
    const rootEast = QuadtreeBuilder.buildHemisphereTree(
      uint16Data,
      mapWidth,
      mapHeight,
      2048,
      0,
      hemisphereSize,
    );

    const { buffer: serializedData, stats } =
      QuadtreeSerializer.serializeDualRoot(
        rootWest,
        rootEast,
        mapWidth,
        mapHeight,
      );

    const outputPath = path.join(strategicDir, "quadtree-state.bin");
    await fs.writeFile(outputPath, serializedData);

    const statsPath = path.join(strategicDir, "quadtree-stats.json");
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), "utf-8");

    const reader = new QuadtreeReader(serializedData);
    let samplePassed = true;

    const sampleStep = 16;
    for (let y = 0; y < mapHeight; y += sampleStep) {
      for (let x = 0; x < mapWidth; x += sampleStep) {
        const rawPid = uint16Data[y * mapWidth + x]! & 0x0fff;
        const quadPid = reader.getProvinceId(x, y);
        if (rawPid !== quadPid) {
          samplePassed = false;
          break;
        }
      }
      if (!samplePassed) break;
    }

    return {
      stats,
      verificationPassed: samplePassed,
    };
  }
}
