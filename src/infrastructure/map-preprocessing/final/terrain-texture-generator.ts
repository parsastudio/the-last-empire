import { PngEncoder } from "@/infrastructure/map-preprocessing/encoders/png-encoder";

export class TerrainTextureGenerator {
  public static generateStaticTerrain(
    maskBuffer: Uint8Array,
    width: number,
    height: number,
  ): Buffer {
    const rgbBuffer = new Uint8Array(width * height * 3);

    const oceanR = 15;
    const oceanG = 25;
    const oceanB = 40;

    const landR = 30;
    const landG = 38;
    const landB = 52;

    const coastR = 45;
    const coastG = 60;
    const coastB = 80;

    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      const val = maskBuffer[i] || 0;
      const rgbIndex = i * 3;

      if (val === 0) {
        rgbBuffer[rgbIndex] = oceanR;
        rgbBuffer[rgbIndex + 1] = oceanG;
        rgbBuffer[rgbIndex + 2] = oceanB;
      } else if (val === 254) {
        rgbBuffer[rgbIndex] = coastR;
        rgbBuffer[rgbIndex + 1] = coastG;
        rgbBuffer[rgbIndex + 2] = coastB;
      } else {
        rgbBuffer[rgbIndex] = landR;
        rgbBuffer[rgbIndex + 1] = landG;
        rgbBuffer[rgbIndex + 2] = landB;
      }
    }

    return PngEncoder.encodeRgbPng(width, height, rgbBuffer);
  }
}
