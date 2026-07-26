import { CountryPaletteGenerator } from "./shader/country-palette-generator";
import { ShorelineShadowCalculator } from "./shader/shoreline-shadow-calculator";
import { MapBevelShader } from "./shader/map-bevel-shader";
import { NoiseGrainApplier } from "./shader/noise-grain-applier";

interface Country {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
}

export class MapShader {
  private static paletteGenerator = new CountryPaletteGenerator();
  private static shadowCalculator = new ShorelineShadowCalculator();
  private static bevelShader = new MapBevelShader();
  private static noiseApplier = new NoiseGrainApplier();

  public static applyShading(
    srcData: Uint8ClampedArray,
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    maskData: Uint8Array,
    countries: Country[],
  ): void {
    const palette = this.paletteGenerator.generatePalette(countries);
    const dist = new Int32Array(width * height);
    dist.fill(9999);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = maskData[idx];
        if (val && val >= 11) {
          dist[idx] = 0;
        } else {
          if (x > 0) dist[idx] = Math.min(dist[idx], dist[idx - 1] + 1);
          if (y > 0) dist[idx] = Math.min(dist[idx], dist[idx - width] + 1);
        }
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) dist[idx] = Math.min(dist[idx], dist[idx + 1] + 1);
        if (y < height - 1)
          dist[idx] = Math.min(dist[idx], dist[idx + width] + 1);
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const id = srcData[idx + 2] || 0;

        let r = 255;
        let g = 255;
        let b = 255;

        const grain = this.noiseApplier.getNoiseGrain(x, y);

        if (id < 11) {
          if (id === 1) {
            r = 16;
            g = 185;
            b = 129;
          } else {
            const d = dist[y * width + x] || 0;
            const oceanColor = this.shadowCalculator.calculateOceanColor(d);
            r = oceanColor.r;
            g = oceanColor.g;
            b = oceanColor.b;
          }
        } else {
          const pair = palette[id];
          if (pair) {
            const countryColor = this.bevelShader.calculateBevel(
              r,
              g,
              b,
              pair,
              x,
              y,
              width,
              height,
              id,
              srcData,
            );
            r = countryColor.r;
            g = countryColor.g;
            b = countryColor.b;
          }
        }

        let isBorder = false;
        if (x < width - 1) {
          const rightId = srcData[idx + 4 + 2] || 0;
          if (rightId !== id && (id >= 11 || rightId >= 11)) {
            isBorder = true;
          }
        }
        if (y < height - 1) {
          const bottomId = srcData[idx + width * 4 + 2] || 0;
          if (bottomId !== id && (id >= 11 || bottomId >= 11)) {
            isBorder = true;
          }
        }

        if (isBorder) {
          r = 80;
          g = 72;
          b = 65;
        }

        destData[idx] = Math.max(0, Math.min(255, r + grain));
        destData[idx + 1] = Math.max(0, Math.min(255, g + grain));
        destData[idx + 2] = Math.max(0, Math.min(255, b + grain));
        destData[idx + 3] = 255;
      }
    }
  }
}
