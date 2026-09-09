import { RawPalettedTerrain, TerrainColorRGB } from "./terrain-binary-types";

export class TerrainBinaryBuilder {
  public static buildFromRgba(
    rgbaData: Uint8Array,
    width: number,
    height: number,
  ): RawPalettedTerrain {
    const totalPixels = width * height;
    const rawIndexedGrid = new Uint8Array(totalPixels);
    const palette: TerrainColorRGB[] = [];
    const colorToIndexMap = new Map<number, number>();

    for (let i = 0; i < totalPixels; i++) {
      const idx = i << 2;
      const r = rgbaData[idx]!;
      const g = rgbaData[idx + 1]!;
      const b = rgbaData[idx + 2]!;
      const key = (r << 16) | (g << 8) | b;

      let colorIdx = colorToIndexMap.get(key);
      if (colorIdx === undefined) {
        colorIdx = palette.length;
        palette.push({ r, g, b });
        colorToIndexMap.set(key, colorIdx);
      }

      rawIndexedGrid[i] = colorIdx & 0xff;
    }

    return {
      palette,
      rawIndexedGrid,
    };
  }
}
