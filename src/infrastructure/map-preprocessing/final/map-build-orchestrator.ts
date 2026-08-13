import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { PNG } from "pngjs";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { FinalManifestBuilder } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { LandPartitionEngine } from "@/infrastructure/map-preprocessing/final/land-partition-engine";
import { ProvincePartitionEngine } from "@/infrastructure/map-preprocessing/final/province-partition-engine";
import { ServerMapPathResolver } from "@/infrastructure/map-preprocessing/server-map-path-resolver";

export class MapBuildOrchestrator {
  private manifestBuilder = new FinalManifestBuilder();

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
    const startTime = performance.now();

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
    const rawNationGrid = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const r = png.data[idx]!;
        const g = png.data[idx + 1]!;
        const b = png.data[idx + 2]!;

        let nationId = 0;
        if (b >= 11 && b < 250) {
          nationId = b;
        } else if (r >= 11 && r < 250) {
          nationId = r;
        } else if (g >= 11 && g < 250) {
          nationId = g;
        }

        rawNationGrid[y * width + x] = nationId;
      }
    }

    const { consolidatedNationGrid } =
      LandPartitionEngine.partitionAndConsolidate(
        rawNationGrid,
        width,
        height,
        bitBuffer,
      );

    const provinceMap = ProvincePartitionEngine.partitionProvinces(
      consolidatedNationGrid,
      width,
      height,
      bitBuffer,
    );

    const binPath = path.join(outputDir, "live-state.bin");
    const uint8Buf = bitBuffer.toUint8ArrayBuffer();
    await fs.writeFile(binPath, uint8Buf);

    await this.manifestBuilder.buildAndSave(mapId, provinceMap, width, height);

    const terrainPath = ServerMapPathResolver.getTerrainServerPath(mapId);
    if (terrainPath && fsSync.existsSync(terrainPath)) {
      const destTerrainPath = path.join(outputDir, "base_map_terrain.png");
      await fs.copyFile(terrainPath, destTerrainPath);
    }
  }
}
