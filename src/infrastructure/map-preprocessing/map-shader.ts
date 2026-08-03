import { CountryPaletteGenerator } from "@/infrastructure/map-preprocessing/shader/country-palette-generator";
import {
  CountryProfileLookupCache,
  GdpLayerShader,
} from "@/infrastructure/map-preprocessing/shader/gdp-layer-shader";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

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

  public static applyShadingFromBitBuffer(
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    buffer: BitPackedBuffer,
    countries: Country[],
    activeLayer: "political" | "gdp" = "political",
  ): void {
    const dest32 = new Uint32Array(destData.buffer);
    const palette = this.paletteGenerator.generatePalette(countries);
    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      const id = buffer.getNationId(x, y);

      if (id < 11 || id >= 250) {
        dest32[i] = (255 << 24) | (40 << 16) | (25 << 8) | 15;
        continue;
      }

      let r = 255;
      let g = 255;
      let b = 255;

      if (activeLayer === "gdp") {
        const color = this.gdpShader.calculateGdpColor(id, this.lookupCache);
        r = color.r;
        g = color.g;
        b = color.b;
      } else {
        const pair = palette[id];
        if (pair) {
          r = pair.r1;
          g = pair.g1;
          b = pair.b1;
        }
      }

      dest32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
    }
  }
}
