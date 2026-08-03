import { CountryPaletteGenerator } from "@/infrastructure/map-preprocessing/shader/country-palette-generator";
import {
  CountryProfileLookupCache,
  GdpLayerShader,
} from "@/infrastructure/map-preprocessing/shader/gdp-layer-shader";
import { StaticMapCacheBuilder } from "@/infrastructure/map-preprocessing/shader/static-map-cache-builder";
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
  private static lookupCache = new CountryProfileLookupCache();
  private static gdpShader = new GdpLayerShader();
  private static staticCacheBuilder = new StaticMapCacheBuilder();

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
    const staticCache = this.staticCacheBuilder.buildOrGetCache(
      maskData,
      width,
      height,
    );

    let dynamicIds: Uint16Array | null = null;

    const gridState = GridStateProvider.getInstance();
    const modifiedCells = gridState.getModifiedCells();

    if (modifiedCells.length > 0) {
      const scaleX = width / 1024;
      const scaleY = height / 512;
      for (let i = 0; i < modifiedCells.length; i++) {
        const cell = modifiedCells[i]!;
        const dynamicId = parseInt(cell.ownerId.replace("NATION_", ""), 10);
        if (!isNaN(dynamicId) && dynamicId >= 11) {
          if (!dynamicIds) {
            dynamicIds = new Uint16Array(width * height);
          }
          const startX = cell.x * scaleX;
          const startY = cell.y * scaleY;
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

    const landLut32 = new Uint32Array(250 * 3);
    for (let id = 11; id < 250; id++) {
      let baseR = 255;
      let baseG = 255;
      let baseB = 255;

      if (activeLayer === "gdp") {
        const color = this.gdpShader.calculateGdpColor(id, this.lookupCache);
        baseR = color.r;
        baseG = color.g;
        baseB = color.b;
      } else {
        const pair = palette[id];
        if (pair) {
          baseR = pair.r1;
          baseG = pair.g1;
          baseB = pair.b1;
        }
      }

      for (let bCase = 0; bCase < 3; bCase++) {
        let bevelMult = 1.0;
        if (bCase === 0) bevelMult = 0.98;
        if (bCase === 2) bevelMult = 1.02;

        const finalR = Math.max(
          0,
          Math.min(255, Math.floor(baseR * bevelMult)),
        );
        const finalG = Math.max(
          0,
          Math.min(255, Math.floor(baseG * bevelMult)),
        );
        const finalB = Math.max(
          0,
          Math.min(255, Math.floor(baseB * bevelMult)),
        );

        landLut32[id * 3 + bCase] =
          (255 << 24) | (finalB << 16) | (finalG << 8) | finalR;
      }
    }

    const borderUint32 = (255 << 24) | (65 << 16) | (72 << 8) | 80;
    const ocean32 = staticCache.ocean32;
    const borderMask = staticCache.borderMask;
    const bevelCase = staticCache.bevelCase;
    const landIndices = staticCache.landIndices;

    dest32.set(ocean32);

    const landCount = landIndices.length;

    if (!dynamicIds) {
      for (let k = 0; k < landCount; k++) {
        const i = landIndices[k]!;
        const id = maskData[i] || 0;

        if (borderMask[i] === 1) {
          dest32[i] = borderUint32;
          continue;
        }

        const bCase = bevelCase[i]!;
        dest32[i] = landLut32[id * 3 + bCase] || 0xffffffff;
      }
    } else {
      for (let k = 0; k < landCount; k++) {
        const i = landIndices[k]!;
        const originalMaskId = maskData[i] || 0;
        let id = originalMaskId;

        if (dynamicIds[i]! > 0) {
          id = dynamicIds[i]!;
        }

        if (borderMask[i] === 1 && id === originalMaskId) {
          dest32[i] = borderUint32;
          continue;
        }

        const bCase = bevelCase[i]!;
        dest32[i] = landLut32[id * 3 + bCase] || 0xffffffff;
      }
    }
  }
}
