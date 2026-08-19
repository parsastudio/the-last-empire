import fs from "fs/promises";
import path from "path";
import { PNG } from "pngjs";
import {
  TerrainProcessingContext,
  TacticalTerrainOptions,
  TacticalTerrainStats,
} from "@/infrastructure/tactical-terrain-enhancer/core/tactical-terrain.types";
import { TacticalTerrainComposer } from "@/infrastructure/tactical-terrain-enhancer/composer/tactical-terrain-composer";
import { MaskPixelDecoder } from "@/infrastructure/map-preprocessing/pipeline/01-ingestion/mask-pixel-decoder";
import { TerrainBinaryExportService } from "@/infrastructure/terrain-binary-map/generator/terrain-binary-export-service";

export class TacticalTerrainExporter {
  public static async buildDirectlyFromMask(
    sourceMaskPngPath: string,
    outputPngPath: string,
    options?: Partial<TacticalTerrainOptions>,
  ): Promise<TacticalTerrainStats> {
    const startTime = Date.now();
    const imageBuffer = await fs.readFile(sourceMaskPngPath);

    const maskPng = await new Promise<PNG>((resolve, reject) => {
      new PNG().parse(imageBuffer, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const width = maskPng.width;
    const height = maskPng.height;
    const totalPixels = width * height;

    const rawNationGrid = MaskPixelDecoder.decodeNationGrid(
      maskPng,
      width,
      height,
    );

    const landMask = new Uint8Array(totalPixels);
    let landCount = 0;

    for (let i = 0; i < totalPixels; i++) {
      const val = rawNationGrid[i]!;
      if (val >= 11 && val < 250) {
        landMask[i] = 1;
        landCount++;
      } else {
        landMask[i] = 0;
      }
    }

    const oceanDistField = this.computeNearCoastDistanceField(
      landMask,
      width,
      height,
    );
    const landDistField = new Float32Array(totalPixels);

    const ctx: TerrainProcessingContext = {
      width,
      height,
      landMask,
      oceanDistField,
      landDistField,
    };

    const effectiveOptions: TacticalTerrainOptions = {
      enableHillshading: false,
      enableBathymetryContours: options?.enableBathymetryContours ?? true,
      enableCoastalVignette: options?.enableCoastalVignette ?? true,
      enableTacticalGraticule: options?.enableTacticalGraticule ?? true,
      sunAzimuthDegrees: 315,
      sunAltitudeDegrees: 45,
      reliefExaggeration: 1.0,
    };

    const rgbaData = TacticalTerrainComposer.composeTerrain(
      ctx,
      effectiveOptions,
    );

    const outputPng = new PNG({ width, height });
    outputPng.data.set(rgbaData);

    const outputBuffer = PNG.sync.write(outputPng);
    const outputDir = path.dirname(outputPngPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPngPath, outputBuffer);

    await TerrainBinaryExportService.generateAndExportFromRgba(
      rgbaData,
      width,
      height,
      outputDir,
    );

    return {
      width,
      height,
      totalPixels,
      landPixels: landCount,
      oceanPixels: totalPixels - landCount,
      outputSizeBytes: outputBuffer.byteLength,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private static computeNearCoastDistanceField(
    landMask: Uint8Array,
    width: number,
    height: number,
  ): Float32Array {
    const totalPixels = width * height;
    const dist = new Float32Array(totalPixels);
    dist.fill(100.0);

    const maxRadius = 6;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (landMask[idx] === 1) {
          dist[idx] = 0.0;
          continue;
        }

        let isImmediateBorder = false;
        const leftX = (x - 1 + width) % width;
        const rightX = (x + 1) % width;

        if (
          (y > 0 && landMask[(y - 1) * width + x] === 1) ||
          (y < height - 1 && landMask[(y + 1) * width + x] === 1) ||
          landMask[rowOffset + leftX] === 1 ||
          landMask[rowOffset + rightX] === 1
        ) {
          isImmediateBorder = true;
          dist[idx] = 1.0;
        }

        if (!isImmediateBorder) {
          let minD = 100.0;
          for (let dy = -maxRadius; dy <= maxRadius; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            const nRow = ny * width;

            for (let dx = -maxRadius; dx <= maxRadius; dx++) {
              const nx = (x + dx + width) % width;
              if (landMask[nRow + nx] === 1) {
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < minD) {
                  minD = d;
                }
              }
            }
          }
          dist[idx] = minD;
        }
      }
    }

    return dist;
  }
}
