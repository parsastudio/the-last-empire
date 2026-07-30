import { ShorelineShadowCalculator } from "./shoreline-shadow-calculator";
import { ShorelineDistanceCache } from "./shoreline-distance-cache";

export interface StaticMapCache {
  ocean32: Uint32Array;
  borderMask: Uint8Array;
  bevelCase: Uint8Array;
  landIndices: Uint32Array;
}

export class StaticMapCacheBuilder {
  private static cachedMaskRef: Uint8Array | null = null;
  private static cachedResult: StaticMapCache | null = null;
  private shadowCalculator = new ShorelineShadowCalculator();

  public buildOrGetCache(
    maskData: Uint8Array,
    width: number,
    height: number,
  ): StaticMapCache {
    if (
      StaticMapCacheBuilder.cachedMaskRef === maskData &&
      StaticMapCacheBuilder.cachedResult
    ) {
      return StaticMapCacheBuilder.cachedResult;
    }

    const totalPixels = width * height;
    const ocean32 = new Uint32Array(totalPixels);
    const borderMask = new Uint8Array(totalPixels);
    const bevelCase = new Uint8Array(totalPixels);

    const dist = ShorelineDistanceCache.getOrCreateDistanceTransform(
      maskData,
      width,
      height,
    );

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    let landCount = 0;
    for (let i = 0; i < totalPixels; i++) {
      const id = maskData[i] || 0;
      if (id >= 11 && id < 251) {
        landCount++;
      }
    }

    const landIndices = new Uint32Array(landCount);
    let landIdxCursor = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIdx = y * width + x;
        const id = maskData[pixelIdx] || 0;

        if (id < 11 || id === 254) {
          const d = id === 254 ? 4 : dist[pixelIdx] || 0;
          ocean32[pixelIdx] = this.shadowCalculator.getOceanUint32(d);
          continue;
        }

        if (id >= 11 && id < 251) {
          landIndices[landIdxCursor++] = pixelIdx;
        }

        let isBorder = false;

        for (let k = 0; k < 4; k++) {
          const nx = x + neighbors[k]!.dx;
          const ny = y + neighbors[k]!.dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            const nId = maskData[nIdx] || 0;

            if (nId !== id) {
              if (nId < 11 || nId === 254) {
                isBorder = true;
                break;
              } else if (id < nId && nId >= 11 && nId < 250) {
                isBorder = true;
                break;
              }
            }
          }
        }

        if (isBorder) {
          borderMask[pixelIdx] = 1;
          continue;
        }

        let idLeft = id;
        if (x > 2) {
          idLeft = maskData[pixelIdx - 2] || 0;
        }

        let idTop = id;
        if (y > 2) {
          idTop = maskData[pixelIdx - width * 2] || 0;
        }

        let idRight = id;
        if (x < width - 2) {
          idRight = maskData[pixelIdx + 2] || 0;
        }

        let idBottom = id;
        if (y < height - 2) {
          idBottom = maskData[pixelIdx + width * 2] || 0;
        }

        let bCase = 1;
        if (idLeft !== id || idTop !== id) {
          bCase = 2;
        } else if (idRight !== id || idBottom !== id) {
          bCase = 0;
        }

        bevelCase[pixelIdx] = bCase;
      }
    }

    const result: StaticMapCache = {
      ocean32,
      borderMask,
      bevelCase,
      landIndices,
    };

    StaticMapCacheBuilder.cachedMaskRef = maskData;
    StaticMapCacheBuilder.cachedResult = result;

    return result;
  }

  public static clearCache(): void {
    StaticMapCacheBuilder.cachedMaskRef = null;
    StaticMapCacheBuilder.cachedResult = null;
  }
}
