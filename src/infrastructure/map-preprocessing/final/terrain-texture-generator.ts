import { PngEncoder } from "@/infrastructure/map-preprocessing/encoders/png-encoder";
import {
  ShorelineDistanceCache,
  ShorelineShadowCalculator,
} from "@/infrastructure/map-preprocessing/shader/static-map-cache-builder";

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
