export interface StaticMapCache {
  ocean32: Uint32Array;
  borderMask: Uint8Array;
  bevelCase: Uint8Array;
  landIndices: Uint32Array;
}

export class ShorelineDistanceCache {
  private static cachedMaskRef: Uint8Array | null = null;
  private static cachedDist: Int32Array | null = null;

  public static getOrCreateDistanceTransform(
    maskData: Uint8Array,
    width: number,
    height: number,
  ): Int32Array {
    if (
      this.cachedMaskRef === maskData &&
      this.cachedDist &&
      this.cachedDist.length === width * height
    ) {
      return this.cachedDist;
    }

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

    this.cachedMaskRef = maskData;
    this.cachedDist = dist;

    return dist;
  }
}

export class ShorelineShadowCalculator {
  private readonly shoreR = 198;
  private readonly shoreG = 216;
  private readonly shoreB = 214;

  private readonly midR = 175;
  private readonly midG = 196;
  private readonly midB = 202;

  private readonly deepR = 142;
  private readonly deepG = 166;
  private readonly deepB = 180;

  private lut32 = new Uint32Array(256);

  constructor() {
    this.precomputeLut();
  }

  private precomputeLut(): void {
    for (let d = 0; d < 256; d++) {
      const t = 1.0 - Math.exp(-d * 0.12);
      let r = 255;
      let g = 255;
      let b = 255;

      if (t < 0.5) {
        const ratio = t / 0.5;
        r = Math.floor(this.shoreR * (1.0 - ratio) + this.midR * ratio);
        g = Math.floor(this.shoreG * (1.0 - ratio) + this.midG * ratio);
        b = Math.floor(this.shoreB * (1.0 - ratio) + this.midB * ratio);
      } else {
        const ratio = (t - 0.5) / 0.5;
        r = Math.floor(this.midR * (1.0 - ratio) + this.deepR * ratio);
        g = Math.floor(this.midG * (1.0 - ratio) + this.deepG * ratio);
        b = Math.floor(this.deepB * (1.0 - ratio) + this.deepB * ratio);
      }

      if (d >= 1 && d <= 12) {
        const shadow = 0.82 + 0.18 * ((d - 1) / 11);
        r = Math.floor(r * shadow);
        g = Math.floor(g * shadow);
        b = Math.floor(b * shadow);
      }

      this.lut32[d] = (255 << 24) | (b << 16) | (g << 8) | r;
    }
  }

  public getOceanUint32(d: number): number {
    const clampedDist = Math.max(0, Math.min(255, d));
    return this.lut32[clampedDist] || 0xffb4a68e;
  }

  public getOceanRgb(d: number): [number, number, number] {
    const clampedDist = Math.max(0, Math.min(255, d));
    const val = this.lut32[clampedDist] || 0xffb4a68e;
    const r = val & 0xff;
    const g = (val >> 8) & 0xff;
    const b = (val >> 16) & 0xff;
    return [r, g, b];
  }
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
