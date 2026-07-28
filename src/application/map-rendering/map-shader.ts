import { CountryPaletteGenerator } from "./shader/country-palette-generator";
import { ShorelineShadowCalculator } from "./shader/shoreline-shadow-calculator";
import { NoiseGrainApplier } from "./shader/noise-grain-applier";
import { CountryProfileLookupCache } from "./shader/country-profile-lookup-cache";
import { GdpLayerShader } from "./shader/gdp-layer-shader";
import { MilitaryLayerShader } from "./shader/military-layer-shader";
import { PoliticalLayerShader } from "./shader/political-layer-shader";
import { BorderDetector } from "./shader/border-detector";

interface Country {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class MapShader {
  private static paletteGenerator = new CountryPaletteGenerator();
  private static shadowCalculator = new ShorelineShadowCalculator();
  private static noiseApplier = new NoiseGrainApplier();
  private static lookupCache = new CountryProfileLookupCache();

  private static gdpShader = new GdpLayerShader();
  private static militaryShader = new MilitaryLayerShader();
  private static politicalShader = new PoliticalLayerShader();
  private static borderDetector = new BorderDetector();

  public static applyShading(
    srcData: Uint8ClampedArray,
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    maskData: Uint8Array,
    countries: Country[],
    activeLayer: "political" | "gdp" | "military" = "political",
  ): void {
    const palette = this.paletteGenerator.generatePalette(countries);
    const dist = new Int32Array(width * height);
    dist.fill(9999);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = maskData[idx];
        if (val && val >= 11 && val < 250) {
          dist[idx] = 0;
        } else {
          if (x > 0) dist[idx] = Math.min(dist[idx]!, dist[idx - 1]! + 1);
          if (y > 0) dist[idx] = Math.min(dist[idx]!, dist[idx - width]! + 1);
        }
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) dist[idx] = Math.min(dist[idx]!, dist[idx + 1]! + 1);
        if (y < height - 1)
          dist[idx] = Math.min(dist[idx]!, dist[idx + width]! + 1);
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

        if (id === 254) {
          const oceanColor = this.shadowCalculator.calculateOceanColor(4);
          r = oceanColor.r;
          g = oceanColor.g;
          b = oceanColor.b;
        } else if (id >= 251 && id <= 255) {
          r = 16;
          g = 185;
          b = 129;
        } else if (id < 11) {
          const d = dist[y * width + x] || 0;
          const oceanColor = this.shadowCalculator.calculateOceanColor(d);
          r = oceanColor.r;
          g = oceanColor.g;
          b = oceanColor.b;
        } else {
          const pair = palette[id];
          if (pair) {
            if (activeLayer === "gdp") {
              const color = this.gdpShader.calculateGdpColor(
                id,
                this.lookupCache,
              );
              r = color.r;
              g = color.g;
              b = color.b;
            } else if (activeLayer === "military") {
              const color = this.militaryShader.calculateMilitaryColor(
                id,
                this.lookupCache,
              );
              r = color.r;
              g = color.g;
              b = color.b;
            } else {
              const color = this.politicalShader.calculatePoliticalColor(
                id,
                pair,
                x,
                y,
                width,
                height,
                srcData,
              );
              r = color.r;
              g = color.g;
              b = color.b;
            }
          }
        }

        if (
          this.borderDetector.isSovereignBorder(
            x,
            y,
            width,
            height,
            id,
            idx,
            srcData,
          )
        ) {
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
