import fs from "fs/promises";
import path from "path";
import { ServerMapPathResolver } from "@/infrastructure/core/io/server-map-path-resolver";
import { RowSpansBuilder } from "./row-spans-builder";
import { RowSpansSerializer } from "./row-spans-serializer";
import { RowSpansReader } from "./row-spans-reader";
import { RowSpansBuildStats } from "./row-spans-types";

export class RowSpansExportService {
  public static async generateFromLiveState(mapId = "map1"): Promise<{
    stats: RowSpansBuildStats;
    verificationPassed: boolean;
    totalPixelsVerified: number;
    mismatchCount: number;
  }> {
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

    const builtSpans = RowSpansBuilder.build(uint16Data, mapWidth, mapHeight);

    const { buffer: serializedData, stats } = RowSpansSerializer.serialize(
      builtSpans,
      mapWidth,
      mapHeight,
    );

    const outputPath = path.join(strategicDir, "row-spans-state.bin");
    await fs.writeFile(outputPath, serializedData);

    const statsPath = path.join(strategicDir, "row-spans-stats.json");
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), "utf-8");

    const reader = new RowSpansReader(serializedData);

    let mismatchCount = 0;
    const totalPixels = mapWidth * mapHeight;

    for (let y = 0; y < mapHeight; y++) {
      const rowOffset = y * mapWidth;
      for (let x = 0; x < mapWidth; x++) {
        const rawPid = uint16Data[rowOffset + x]! & 0x0fff;
        const decodedPid = reader.getProvinceId(x, y);

        if (rawPid !== decodedPid) {
          mismatchCount++;
        }
      }
    }

    return {
      stats,
      verificationPassed: mismatchCount === 0,
      totalPixelsVerified: totalPixels,
      mismatchCount,
    };
  }
}
