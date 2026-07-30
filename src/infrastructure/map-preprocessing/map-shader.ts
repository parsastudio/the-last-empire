import { CountryPaletteGenerator } from "./shader/country-palette-generator";
import { ShorelineShadowCalculator } from "./shader/shoreline-shadow-calculator";
import { NoiseGrainApplier } from "./shader/noise-grain-applier";
import { CountryProfileLookupCache } from "./shader/country-profile-lookup-cache";
import { GdpLayerShader } from "./shader/gdp-layer-shader";
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

    const landLut32 = new Uint32Array(256 * 3);

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

        if (id < 11 || id === 254) {
          const d = id === 254 ? 4 : dist[pixelIdx] || 0;
          dest32[pixelIdx] = this.shadowCalculator.getOceanUint32(d);
          continue;
        }

        if (id >= 251 && id <= 255) {
          dest32[pixelIdx] = (255 << 24) | (129 << 16) | (185 << 8) | 16;
          continue;
        }

        let isBorder = false;

        if (x < width - 1) {
          const rightIdx = pixelIdx + 1;
          let rightOwner = maskData[rightIdx] || 0;
          if (
            dynamicIds &&
            dynamicIds[rightIdx]! > 0 &&
            rightOwner >= 11 &&
            rightOwner < 250
          ) {
            rightOwner = dynamicIds[rightIdx]!;
          }
          if (
            rightOwner !== id &&
            ((id >= 11 && id < 250) || (rightOwner >= 11 && rightOwner < 250))
          ) {
            isBorder = true;
          }
        }

        if (!isBorder && y < height - 1) {
          const bottomIdx = pixelIdx + width;
          let bottomOwner = maskData[bottomIdx] || 0;
          if (
            dynamicIds &&
            dynamicIds[bottomIdx]! > 0 &&
            bottomOwner >= 11 &&
            bottomOwner < 250
          ) {
            bottomOwner = dynamicIds[bottomIdx]!;
          }
          if (
            bottomOwner !== id &&
            ((id >= 11 && id < 250) || (bottomOwner >= 11 && bottomOwner < 250))
          ) {
            isBorder = true;
          }
        }

        if (isBorder) {
          dest32[pixelIdx] = borderUint32;
          continue;
        }

        let idLeft = id;
        if (x > 2) {
          const leftIdx = pixelIdx - 2;
          idLeft = maskData[leftIdx] || 0;
          if (dynamicIds && dynamicIds[leftIdx]! > 0) {
            idLeft = dynamicIds[leftIdx]!;
          }
        }

        let idTop = id;
        if (y > 2) {
          const topIdx = pixelIdx - width * 2;
          idTop = maskData[topIdx] || 0;
          if (dynamicIds && dynamicIds[topIdx]! > 0) {
            idTop = dynamicIds[topIdx]!;
          }
        }

        let idRight = id;
        if (x < width - 2) {
          const rightIdx = pixelIdx + 2;
          idRight = maskData[rightIdx] || 0;
          if (dynamicIds && dynamicIds[rightIdx]! > 0) {
            idRight = dynamicIds[rightIdx]!;
          }
        }

        let idBottom = id;
        if (y < height - 2) {
          const bottomIdx = pixelIdx + width * 2;
          idBottom = maskData[bottomIdx] || 0;
          if (dynamicIds && dynamicIds[bottomIdx]! > 0) {
            idBottom = dynamicIds[bottomIdx]!;
          }
        }

        let bevelCase = 1;
        if (idLeft !== id || idTop !== id) {
          bevelCase = 2;
        } else if (idRight !== id || idBottom !== id) {
          bevelCase = 0;
        }

        dest32[pixelIdx] = landLut32[id * 3 + bevelCase] || 0xffffffff;
      }
    }
  }
}
