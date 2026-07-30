import { CountryPaletteGenerator } from "./country-palette-generator";
import { CountryProfileLookupCache } from "./country-profile-lookup-cache";
import { GdpLayerShader } from "./gdp-layer-shader";

export interface RenderCountry {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class FastPaletteSwapEngine {
  private paletteGenerator = new CountryPaletteGenerator();
  private lookupCache = new CountryProfileLookupCache();
  private gdpShader = new GdpLayerShader();

  public swapLayerPalette(
    canvasShaded: HTMLCanvasElement,
    mapWidth: number,
    mapHeight: number,
    maskData: Uint8Array,
    countries: RenderCountry[],
    activeLayer: "political" | "gdp",
    dynamicIds?: Uint16Array | null,
  ): void {
    const ctx = canvasShaded.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, mapWidth, mapHeight);
    const dest32 = new Uint32Array(imgData.data.buffer);

    const lut = new Uint32Array(256);
    const palette = this.paletteGenerator.generatePalette(countries);

    for (let id = 11; id < 250; id++) {
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

      lut[id] = (255 << 24) | (b << 16) | (g << 8) | r;
    }

    const totalPixels = mapWidth * mapHeight;

    for (let i = 0; i < totalPixels; i++) {
      const originalMaskId = maskData[i] || 0;

      if (originalMaskId < 11 || originalMaskId >= 250) {
        continue;
      }

      let id = originalMaskId;
      if (dynamicIds && dynamicIds[i]! > 0) {
        id = dynamicIds[i]!;
      }

      const targetColor = lut[id];
      if (targetColor) {
        dest32[i] = targetColor;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }
}
