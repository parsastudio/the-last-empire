import { CountryPaletteGenerator } from "./shader/country-palette-generator";
import { ShorelineShadowCalculator } from "./shader/shoreline-shadow-calculator";
import { NoiseGrainApplier } from "./shader/noise-grain-applier";
import { CountryProfileLookupCache } from "./shader/country-profile-lookup-cache";
import { GdpLayerShader } from "./shader/gdp-layer-shader";
import { PoliticalLayerShader } from "./shader/political-layer-shader";
import { BorderDetector } from "./shader/border-detector";
import { ShorelineDistanceCache } from "./shader/shoreline-distance-cache";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";

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
  private static politicalShader = new PoliticalLayerShader();
  private static borderDetector = new BorderDetector();

  public static applyShading(
    srcData: Uint8ClampedArray,
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    maskData: Uint8Array,
    countries: Country[],
    activeLayer: "political" | "gdp" = "political",
  ): void {
    const palette = this.paletteGenerator.generatePalette(countries);
    const dist = ShorelineDistanceCache.getOrCreateDistanceTransform(
      maskData,
      width,
      height,
    );

    const gridState = GridStateProvider.getInstance();
    const hasGridCells = gridState.getAllCells().length > 0;

    const dynamicIds = hasGridCells ? new Uint16Array(width * height) : null;

    if (hasGridCells && dynamicIds) {
      const scaleX = width / 1024;
      const scaleY = height / 512;
      for (let y = 0; y < height; y++) {
        const gy = Math.floor(y / scaleY);
        for (let x = 0; x < width; x++) {
          const gx = Math.floor(x / scaleX);
          const cell = gridState.getCell(gx, gy);
          if (cell && cell.ownerId.startsWith("NATION_")) {
            const dynamicId = parseInt(cell.ownerId.replace("NATION_", ""), 10);
            if (!isNaN(dynamicId) && dynamicId >= 11) {
              const pIdx = (y * width + x) * 4;
              const originalMaskId = srcData[pIdx + 2] || 0;
              if (
                originalMaskId >= 11 &&
                originalMaskId < 250 &&
                dynamicId !== originalMaskId
              ) {
                dynamicIds[y * width + x] = dynamicId;
              }
            }
          }
        }
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const originalMaskId = srcData[idx + 2] || 0;
        let id = originalMaskId;

        if (dynamicIds && dynamicIds[y * width + x]! > 0) {
          id = dynamicIds[y * width + x]!;
        }

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
            dynamicIds,
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
