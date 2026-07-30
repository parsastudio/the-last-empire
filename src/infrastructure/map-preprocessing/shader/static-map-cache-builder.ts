import { ShorelineShadowCalculator } from "./shoreline-shadow-calculator";
import { ShorelineDistanceCache } from "./shoreline-distance-cache";

export interface StaticMapCache {
  ocean32: Uint32Array;
  borderMask: Uint8Array;
  bevelCase: Uint8Array;
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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIdx = y * width + x;
        const id = maskData[pixelIdx] || 0;

        if (id < 11 || id === 254) {
          const d = id === 254 ? 4 : dist[pixelIdx] || 0;
          ocean32[pixelIdx] = this.shadowCalculator.getOceanUint32(d);
          continue;
        }

        let isBorder = false;

        if (x < width - 1) {
          const rightIdx = pixelIdx + 1;
          const rightOwner = maskData[rightIdx] || 0;
          if (
            rightOwner !== id &&
            ((id >= 11 && id < 250) || (rightOwner >= 11 && rightOwner < 250))
          ) {
            isBorder = true;
          }
        }

        if (!isBorder && y < height - 1) {
          const bottomIdx = pixelIdx + width;
          const bottomOwner = maskData[bottomIdx] || 0;
          if (
            bottomOwner !== id &&
            ((id >= 11 && id < 250) || (bottomOwner >= 11 && bottomOwner < 250))
          ) {
            isBorder = true;
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
