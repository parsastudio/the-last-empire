import {
  CountryPaletteGenerator,
  ColorPair,
} from "./country-palette-generator";
import { ShorelineShadowCalculator } from "./shoreline-shadow-calculator";
import { NoiseGrainApplier } from "./noise-grain-applier";
import { CountryProfileLookupCache } from "./country-profile-lookup-cache";
import { GdpLayerShader } from "./gdp-layer-shader";
import { PoliticalLayerShader } from "./political-layer-shader";
import { BorderDetector } from "./border-detector";
import { ShorelineDistanceCache } from "./shoreline-distance-cache";

export interface DirtyBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface RenderCountry {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class DirtyRegionPatchEngine {
  private paletteGenerator = new CountryPaletteGenerator();
  private shadowCalculator = new ShorelineShadowCalculator();
  private noiseApplier = new NoiseGrainApplier();
  private lookupCache = new CountryProfileLookupCache();
  private gdpShader = new GdpLayerShader();
  private politicalShader = new PoliticalLayerShader();
  private borderDetector = new BorderDetector();

  public patchCanvasRegion(
    canvasShaded: HTMLCanvasElement,
    mapWidth: number,
    mapHeight: number,
    maskData: Uint8Array,
    countries: RenderCountry[],
    dirtyBox: DirtyBoundingBox,
    dynamicIds?: Uint16Array | null,
    activeLayer: "political" | "gdp" = "political",
  ): void {
    const ctx = canvasShaded.getContext("2d");
    if (!ctx) return;

    const padding = 3;
    const startX = Math.max(0, dirtyBox.minX - padding);
    const startY = Math.max(0, dirtyBox.minY - padding);
    const endX = Math.min(mapWidth - 1, dirtyBox.maxX + padding);
    const endY = Math.min(mapHeight - 1, dirtyBox.maxY + padding);

    const patchWidth = endX - startX + 1;
    const patchHeight = endY - startY + 1;

    if (patchWidth <= 0 || patchHeight <= 0) return;

    const patchImageData = ctx.createImageData(patchWidth, patchHeight);
    const destData = patchImageData.data;

    const palette = this.paletteGenerator.generatePalette(countries);
    const dist = ShorelineDistanceCache.getOrCreateDistanceTransform(
      maskData,
      mapWidth,
      mapHeight,
    );

    for (let localY = 0; localY < patchHeight; localY++) {
      const globalY = startY + localY;
      for (let localX = 0; localX < patchWidth; localX++) {
        const globalX = startX + localX;
        const pixelIdx = globalY * mapWidth + globalX;
        const localIdx = (localY * patchWidth + localX) * 4;

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

        const grain = this.noiseApplier.getNoiseGrain(globalX, globalY);

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
                globalX,
                globalY,
                mapWidth,
                mapHeight,
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
            globalX,
            globalY,
            mapWidth,
            mapHeight,
            id,
            maskData,
            dynamicIds,
          )
        ) {
          r = 80;
          g = 72;
          b = 65;
        }

        destData[localIdx] = Math.max(0, Math.min(255, r + grain));
        destData[localIdx + 1] = Math.max(0, Math.min(255, g + grain));
        destData[localIdx + 2] = Math.max(0, Math.min(255, b + grain));
        destData[localIdx + 3] = 255;
      }
    }

    ctx.putImageData(patchImageData, startX, startY);
  }
}
