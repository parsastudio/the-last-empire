import { TerrainColorRGB } from "@/infrastructure/visual-pipeline/compression/terrain-binary-types";

export class TerrainBinaryReader {
  private static readonly SPANS_MAGIC = 0x54525350;
  private static readonly HEADER_BYTE_SIZE = 32;

  private mapWidth: number;
  private mapHeight: number;
  private palette: TerrainColorRGB[];
  private rowOffsets: Uint32Array;
  private packedSpans: Uint32Array;

  constructor(source: ArrayBufferLike | Uint8Array) {
    const view = source instanceof Uint8Array ? source : new Uint8Array(source);
    const dataView = new DataView(
      view.buffer,
      view.byteOffset,
      view.byteLength,
    );

    const magic = dataView.getUint32(0, true);
    if (magic !== TerrainBinaryReader.SPANS_MAGIC) {
      throw new Error("Invalid Terrain Spans binary header signature.");
    }

    this.mapWidth = dataView.getUint16(6, true);
    this.mapHeight = dataView.getUint16(8, true);
    const paletteCount = dataView.getUint16(10, true);
    const totalSpans = dataView.getUint32(16, true);

    this.palette = [];
    let pOffset = view.byteOffset + TerrainBinaryReader.HEADER_BYTE_SIZE;
    for (let i = 0; i < paletteCount; i++) {
      this.palette.push({
        r: view[pOffset]!,
        g: view[pOffset + 1]!,
        b: view[pOffset + 2]!,
      });
      pOffset += 4;
    }

    const offsetsOffset = pOffset;
    this.rowOffsets = new Uint32Array(
      view.buffer,
      offsetsOffset,
      this.mapHeight + 1,
    );

    const spansOffset =
      offsetsOffset + (this.mapHeight + 1) * Uint32Array.BYTES_PER_ELEMENT;
    this.packedSpans = new Uint32Array(view.buffer, spansOffset, totalSpans);
  }

  public unpackToRawBuffer(): Uint8Array {
    const totalPixels = this.mapWidth * this.mapHeight;
    const output = new Uint8Array(totalPixels);

    for (let y = 0; y < this.mapHeight; y++) {
      const rowOffset = y * this.mapWidth;
      const startIdx = this.rowOffsets[y]!;
      const endIdx = this.rowOffsets[y + 1]!;

      let currentX = 0;
      for (let s = startIdx; s < endIdx; s++) {
        const span = this.packedSpans[s]!;
        const spanEnd = span >>> 16;
        const colorIndex = span & 0xffff;

        while (currentX <= spanEnd && currentX < this.mapWidth) {
          output[rowOffset + currentX] = colorIndex;
          currentX++;
        }
      }
    }

    return output;
  }
}
