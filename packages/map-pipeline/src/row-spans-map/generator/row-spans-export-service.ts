import fs from "fs/promises";
import path from "path";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server/server-map-path-resolver";
import { RowSpansBuilder } from "@/infrastructure/row-spans-map/builder/row-spans-builder";
import { RowSpansSerializer } from "@/infrastructure/row-spans-map/serializer/row-spans-serializer";
import { RowSpansReader } from "@/infrastructure/row-spans-map/runtime/row-spans-reader";
import { RowSpansBuildStats } from "@/infrastructure/row-spans-map/core/row-spans-types";

export class RowSpansExportService {
  public static async generateFromLiveState(mapId = "map1"): Promise<{
    stats: RowSpansBuildStats;
    verificationPassed: boolean;
    totalPixelsVerified: number;
    mismatchCount: number;
  }> {
    const finalDir = ServerMapPathResolver.getMapFinalServerDir(mapId);
    const liveStatePath = path.join(finalDir, "live-state.bin");

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

    const outputPath = path.join(finalDir, "row-spans-state.bin");
    await fs.writeFile(outputPath, serializedData);

    const statsPath = path.join(finalDir, "row-spans-stats.json");
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
