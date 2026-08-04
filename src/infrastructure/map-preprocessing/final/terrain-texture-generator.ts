import { PngEncoder } from "@/infrastructure/map-preprocessing/encoders/png-encoder";

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
        g = Math.floor(this.midG * (1.0 - ratio) + this.deepB * ratio);
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

  public getOceanRgb(d: number): [number, number, number] {
    const clampedDist = Math.max(0, Math.min(255, d));
    const val = this.lut32[clampedDist] || 0xffb4a68e;
    const r = val & 0xff;
    const g = (val >> 8) & 0xff;
    const b = (val >> 16) & 0xff;
    return [r, g, b];
  }
}

export class TerrainTextureGenerator {
  public static generateStaticTerrain(
    maskBuffer: Uint8Array,
    width: number,
    height: number,
  ): Buffer {
    const rgbBuffer = new Uint8Array(width * height * 3);
    const dist = ShorelineDistanceCache.getOrCreateDistanceTransform(
      maskBuffer,
      width,
      height,
    );
    const shadowCalculator = new ShorelineShadowCalculator();

    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      const val = maskBuffer[i] || 0;
      const rgbIndex = i * 3;

      if (val < 11 || val === 254) {
        const d = val === 254 ? 4 : dist[i] || 0;
        const [r, g, b] = shadowCalculator.getOceanRgb(d);
        rgbBuffer[rgbIndex] = r;
        rgbBuffer[rgbIndex + 1] = g;
        rgbBuffer[rgbIndex + 2] = b;
      } else {
        rgbBuffer[rgbIndex] = 255;
        rgbBuffer[rgbIndex + 1] = 255;
        rgbBuffer[rgbIndex + 2] = 255;
      }
    }

    return PngEncoder.encodeRgbPng(width, height, rgbBuffer);
  }
}
