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
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    maskData: Uint8Array,
    countries: Country[],
    activeLayer: "political" | "gdp" = "political",
  ): void {
    const dest32 = new Uint32Array(destData.buffer);
    const palette = this.paletteGenerator.generatePalette(countries);
    const dist = ShorelineDistanceCache.getOrCreateDistanceTransform(
      maskData,
      width,
      height,
    );

    const gridState = GridStateProvider.getInstance();
    const hasGridCells = gridState.getAllCells().length > 0;

    let dynamicIds: Uint16Array | null = null;

    if (hasGridCells) {
      const scaleX = width / 1024;
      const scaleY = height / 512;
      for (let gy = 0; gy < 512; gy++) {
        for (let gx = 0; gx < 1024; gx++) {
          const cell = gridState.getCell(gx, gy);
          if (
            cell &&
            cell.initialOwnerId &&
            cell.ownerId !== cell.initialOwnerId &&
            cell.ownerId.startsWith("NATION_")
          ) {
            const dynamicId = parseInt(cell.ownerId.replace("NATION_", ""), 10);
            if (!isNaN(dynamicId) && dynamicId >= 11) {
              if (!dynamicIds) {
                dynamicIds = new Uint16Array(width * height);
              }
              const startX = gx * scaleX;
              const startY = gy * scaleY;
              for (let dy = 0; dy < scaleY; dy++) {
                const py = startY + dy;
                for (let dx = 0; dx < scaleX; dx++) {
                  const px = startX + dx;
                  dynamicIds[py * width + px] = dynamicId;
                }
              }
            }
          }
        }
      }
    }

    const borderR = 80;
    const borderG = 72;
    const borderB = 65;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIdx = y * width + x;
        const originalMaskId = maskData[pixelIdx] || 0;
        let id = originalMaskId;

        if (
          dynamicIds &&
          dynamicIds[pixelIdx]! > 0 &&
          originalMaskId >= 11 &&
          originalMaskId < 250
        ) {
          id = dynamicIds[pixelIdx]!;
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
          const d = dist[pixelIdx] || 0;
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
                maskData,
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
            maskData,
            dynamicIds,
          )
        ) {
          r = borderR;
          g = borderG;
          b = borderB;
        }

        const finalR = Math.max(0, Math.min(255, r + grain));
        const finalG = Math.max(0, Math.min(255, g + grain));
        const finalB = Math.max(0, Math.min(255, b + grain));

        dest32[pixelIdx] =
          (255 << 24) | (finalB << 16) | (finalG << 8) | finalR;
      }
    }
  }
}
