import { CountryPaletteGenerator } from "./country-palette-generator";
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
    const dest32 = new Uint32Array(patchImageData.data.buffer);

    const palette = this.paletteGenerator.generatePalette(countries);
    const dist = ShorelineDistanceCache.getOrCreateDistanceTransform(
      maskData,
      mapWidth,
      mapHeight,
    );

    const borderUint32 = (255 << 24) | (65 << 16) | (72 << 8) | 80;

    for (let localY = 0; localY < patchHeight; localY++) {
      const globalY = startY + localY;
      for (let localX = 0; localX < patchWidth; localX++) {
        const globalX = startX + localX;
        const pixelIdx = globalY * mapWidth + globalX;
        const localIdx = localY * patchWidth + localX;

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

        if (id < 11 || id === 254) {
          const d = id === 254 ? 4 : dist[pixelIdx] || 0;
          dest32[localIdx] = this.shadowCalculator.getOceanUint32(d);
          continue;
        }

        if (id >= 251 && id <= 255) {
          dest32[localIdx] = (255 << 24) | (129 << 16) | (185 << 8) | 16;
          continue;
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
          dest32[localIdx] = borderUint32;
          continue;
        }

        let r = 255;
        let g = 255;
        let b = 255;

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

        const grain = this.noiseApplier.getNoiseGrain(globalX, globalY);
        const finalR = Math.max(0, Math.min(255, r + grain));
        const finalG = Math.max(0, Math.min(255, g + grain));
        const finalB = Math.max(0, Math.min(255, b + grain));

        dest32[localIdx] =
          (255 << 24) | (finalB << 16) | (finalG << 8) | finalR;
      }
    }

    ctx.putImageData(patchImageData, startX, startY);
  }
}
