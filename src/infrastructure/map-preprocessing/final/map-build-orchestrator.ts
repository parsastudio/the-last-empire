import fs from "fs/promises";
import path from "path";
import { PNG } from "pngjs";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { WaterBodyClassifier } from "@/infrastructure/map-preprocessing/final/water-body-classifier";
import { FinalManifestBuilder } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { BitPackedEnclaveClusterer } from "@/engine/combat/final/bit-packed-enclave-clusterer";
import { FrontierBitManager } from "@/engine/combat/final/frontier-bit-manager";

export class MapBuildOrchestrator {
  private waterClassifier = new WaterBodyClassifier();
  private enclaveClusterer = new BitPackedEnclaveClusterer();
  private frontierManager = new FrontierBitManager();
  private manifestBuilder = new FinalManifestBuilder();

  public async cleanOutputDirectory(targetDir: string): Promise<void> {
    await fs.mkdir(targetDir, { recursive: true });
    const files = ["manifest.json", "live-state.bin"];
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

    const pixelAreaMap = new Map<number, number>();
    const activeCountryIds = new Set<number>();

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

        if (nationId >= 11 && nationId < 250) {
          bitBuffer.setNationId(x, y, nationId);
          activeCountryIds.add(nationId);
          pixelAreaMap.set(nationId, (pixelAreaMap.get(nationId) || 0) + 1);
        } else {
          bitBuffer.setNationId(x, y, 0);
        }
      }
    }

    this.waterClassifier.processFullMap(bitBuffer);
    this.enclaveClusterer.clusterNationEnclaves(bitBuffer, width, height);
    this.frontierManager.updateAllFrontiers(bitBuffer);

    const binPath = path.join(outputDir, "live-state.bin");
    await fs.writeFile(binPath, bitBuffer.toUint8ArrayBuffer());

    await this.manifestBuilder.buildAndSave(
      mapId,
      activeCountryIds,
      pixelAreaMap,
      width,
      height,
    );
  }
}
