import fs from "fs/promises";
import path from "path";
import { PNG } from "pngjs";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { FinalManifestBuilder } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { LandPartitionEngine } from "@/infrastructure/map-preprocessing/final/land-partition-engine";
import { ProvincePartitionEngine } from "@/infrastructure/map-preprocessing/final/province-partition-engine";

export class MapBuildOrchestrator {
  private manifestBuilder = new FinalManifestBuilder();

  public async cleanOutputDirectory(targetDir: string): Promise<void> {
    console.log(`[DIAGNOSTIC] Cleaning output directory: ${targetDir}`);
    await fs.mkdir(targetDir, { recursive: true });
    const files = ["manifest.json", "live-state.bin"];
    for (const file of files) {
      const filePath = path.join(targetDir, file);
      try {
        await fs.unlink(filePath);
        console.log(`[DIAGNOSTIC] Removed existing file: ${file}`);
      } catch {}
    }
  }

  public async executeRebuild(
    maskPngPath: string,
    outputDir: string,
    mapId = "map1",
  ): Promise<void> {
    const startTime = performance.now();
    console.log(`\n==================================================`);
    console.log(`[DIAGNOSTIC] STARTING MAP REBUILD PIPELINE`);
    console.log(`[DIAGNOSTIC] Mask PNG: ${maskPngPath}`);
    console.log(`[DIAGNOSTIC] Target Directory: ${outputDir}`);
    console.log(`==================================================\n`);

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
    console.log(
      `[DIAGNOSTIC] Image Dimensions: ${width}x${height} (${width * height} total pixels)`,
    );

    const bitBuffer = new BitPackedBuffer(width, height);
    const rawNationGrid = new Uint8Array(width * height);

    let landPixelsCount = 0;
    let waterPixelsCount = 0;

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
        if (nationId > 0) {
          landPixelsCount++;
        } else {
          waterPixelsCount++;
        }
      }
    }

    console.log(
      `[DIAGNOSTIC] Mask Parsing Complete. Land Pixels: ${landPixelsCount}, Water Pixels: ${waterPixelsCount}`,
    );

    console.log(`\n[DIAGNOSTIC] Executing Land Partition Engine...`);
    const { consolidatedNationGrid, activeCountryIds } =
      LandPartitionEngine.partitionAndConsolidate(
        rawNationGrid,
        width,
        height,
        bitBuffer,
      );
    console.log(
      `[DIAGNOSTIC] Land Partition Complete. Active Country IDs Count: ${activeCountryIds.size}`,
    );

    console.log(`\n[DIAGNOSTIC] Executing Province Partition Engine...`);
    const provinceMap = ProvincePartitionEngine.partitionProvinces(
      consolidatedNationGrid,
      width,
      height,
      bitBuffer,
    );
    console.log(
      `[DIAGNOSTIC] Province Partition Complete. Total Provinces Generated in Map: ${provinceMap.size}`,
    );

    const binPath = path.join(outputDir, "live-state.bin");
    const uint8Buf = bitBuffer.toUint8ArrayBuffer();
    await fs.writeFile(binPath, uint8Buf);
    console.log(
      `[DIAGNOSTIC] Written live-state.bin (${uint8Buf.byteLength} bytes)`,
    );

    console.log(`\n[DIAGNOSTIC] Building Final Manifest...`);
    const manifest = await this.manifestBuilder.buildAndSave(
      mapId,
      provinceMap,
      width,
      height,
    );

    const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n==================================================`);
    console.log(`[DIAGNOSTIC] MAP REBUILD FINISHED IN ${elapsedTime}s`);
    console.log(
      `[DIAGNOSTIC] Manifest Provinces: ${manifest.totalProvincesCount}`,
    );
    console.log(`[DIAGNOSTIC] Manifest Nations: ${manifest.totalNationsCount}`);
    console.log(`==================================================\n`);
  }
}
