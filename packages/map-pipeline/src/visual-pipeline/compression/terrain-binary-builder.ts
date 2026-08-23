import {
  BuiltTerrainSpans,
  TerrainColorRGB,
} from "@/infrastructure/visual-pipeline/compression/terrain-binary-types";

export class TerrainBinaryBuilder {
  public static buildFromRgba(
    rgbaData: Uint8Array,
    width: number,
    height: number,
  ): BuiltTerrainSpans {
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

    return this.buildSpansFromIndexed(rawIndexedGrid, palette, width, height);
  }

  public static buildFromIndexedGrid(
    indexedGrid: Uint8Array,
    width: number,
    height: number,
  ): BuiltTerrainSpans {
    const totalPixels = width * height;
    const rawIndexedGrid = new Uint8Array(totalPixels);
    const palette: TerrainColorRGB[] = [];
    const colorToIndexMap = new Map<number, number>();

    for (let i = 0; i < totalPixels; i++) {
      const val = indexedGrid[i]!;
      let colorIdx = colorToIndexMap.get(val);
      if (colorIdx === undefined) {
        colorIdx = palette.length;
        palette.push({ r: val, g: val, b: val });
        colorToIndexMap.set(val, colorIdx);
      }
      rawIndexedGrid[i] = colorIdx & 0xff;
    }

    return this.buildSpansFromIndexed(rawIndexedGrid, palette, width, height);
  }

  private static buildSpansFromIndexed(
    rawIndexedGrid: Uint8Array,
    palette: TerrainColorRGB[],
    width: number,
    height: number,
  ): BuiltTerrainSpans {
    const rowOffsets = new Uint32Array(height + 1);
    const spansList: number[] = [];
    let minSpans = Infinity;
    let maxSpans = 0;

    for (let y = 0; y < height; y++) {
      rowOffsets[y] = spansList.length;
      const rowOffset = y * width;

      let currentColor = rawIndexedGrid[rowOffset]!;
      let rowSpanCount = 0;

      for (let x = 1; x < width; x++) {
        const c = rawIndexedGrid[rowOffset + x]!;
        if (c !== currentColor) {
          const packed = (((x - 1) & 0xffff) << 16) | (currentColor & 0xffff);
          spansList.push(packed >>> 0);
          rowSpanCount++;
          currentColor = c;
        }
      }

      const lastPacked =
        (((width - 1) & 0xffff) << 16) | (currentColor & 0xffff);
      spansList.push(lastPacked >>> 0);
      rowSpanCount++;

      if (rowSpanCount < minSpans) minSpans = rowSpanCount;
      if (rowSpanCount > maxSpans) maxSpans = rowSpanCount;
    }

    rowOffsets[height] = spansList.length;
    const packedSpans = new Uint32Array(spansList);

    return {
      palette,
      rawIndexedGrid,
      rowOffsets,
      packedSpans,
      minSpansPerRow: minSpans === Infinity ? 0 : minSpans,
      maxSpansPerRow: maxSpans,
      totalSpans: spansList.length,
    };
  }
}
