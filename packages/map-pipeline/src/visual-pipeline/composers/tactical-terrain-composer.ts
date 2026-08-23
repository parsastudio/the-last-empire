import {
  RGBColor,
  TerrainProcessingContext,
  TacticalTerrainOptions,
} from "@/infrastructure/visual-pipeline/core/tactical-terrain.types";
import { OceanBathymetryEngine } from "@/infrastructure/visual-pipeline/algorithms/ocean-bathymetry-engine";
import { LandTopographyEngine } from "@/infrastructure/visual-pipeline/algorithms/land-topography-engine";
import { CoastalVignetteEngine } from "@/infrastructure/visual-pipeline/algorithms/coastal-vignette-engine";
import { TacticalGraticuleEngine } from "@/infrastructure/visual-pipeline/algorithms/tactical-graticule-engine";

export class TacticalTerrainComposer {
  public static composeTerrain(
    ctx: TerrainProcessingContext,
    options: TacticalTerrainOptions,
  ): Uint8Array {
    const totalPixels = ctx.width * ctx.height;
    const outputRgba = new Uint8Array(totalPixels * 4);

    for (let y = 0; y < ctx.height; y++) {
      const rowOffset = y * ctx.width;
      for (let x = 0; x < ctx.width; x++) {
        const idx = rowOffset + x;
        const outIdx = idx << 2;
        const isLand = ctx.landMask[idx] === 1;

        let pixelColor: RGBColor;

        if (isLand) {
          pixelColor = LandTopographyEngine.shadeLandColor(x, y);
        } else {
          const dist = ctx.oceanDistField[idx] || 10.0;
          const isLake = ctx.landMask[idx] === 2;

          pixelColor = OceanBathymetryEngine.calculateBathymetryColor(
            dist,
            isLake,
          );

          if (options.enableCoastalVignette) {
            pixelColor = CoastalVignetteEngine.applyCoastalVignette(
              pixelColor,
              dist,
            );
          }

          if (options.enableTacticalGraticule) {
            pixelColor = TacticalGraticuleEngine.applyGraticule(
              x,
              y,
              pixelColor,
              false,
            );
          }
        }

        outputRgba[outIdx] = pixelColor.r;
        outputRgba[outIdx + 1] = pixelColor.g;
        outputRgba[outIdx + 2] = pixelColor.b;
        outputRgba[outIdx + 3] = 255;
      }
    }

    return outputRgba;
  }
}
