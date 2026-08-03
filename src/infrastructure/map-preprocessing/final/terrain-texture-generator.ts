import { PngEncoder } from "@/infrastructure/map-preprocessing/encoders/png-encoder";
import {
  ShorelineDistanceCache,
  ShorelineShadowCalculator,
} from "@/infrastructure/map-preprocessing/shader/static-map-cache-builder";
import { CountryPaletteGenerator } from "@/infrastructure/map-preprocessing/shader/country-palette-generator";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";

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

    const countries = ALL_COUNTRY_PROFILES.map((p) => ({
      id: p.id ?? 0,
      code: p.code,
      name: p.nameFa,
      color: [0, 0, p.id ?? 0] as [number, number, number],
    }));

    const paletteGenerator = new CountryPaletteGenerator();
    const palette = paletteGenerator.generatePalette(countries);

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
        const colorPair = palette[val];
        if (colorPair) {
          rgbBuffer[rgbIndex] = colorPair.r1;
          rgbBuffer[rgbIndex + 1] = colorPair.g1;
          rgbBuffer[rgbIndex + 2] = colorPair.b1;
        } else {
          rgbBuffer[rgbIndex] = 228;
          rgbBuffer[rgbIndex + 1] = 224;
          rgbBuffer[rgbIndex + 2] = 214;
        }
      }
    }

    return PngEncoder.encodeRgbPng(width, height, rgbBuffer);
  }
}
