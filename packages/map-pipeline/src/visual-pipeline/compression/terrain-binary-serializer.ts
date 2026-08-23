import { BuiltTerrainSpans } from "@/infrastructure/visual-pipeline/compression/terrain-binary-types";

export class TerrainBinarySerializer {
  private static readonly RAW_MAGIC = 0x54524157;
  private static readonly SPANS_MAGIC = 0x54525350;
  private static readonly FORMAT_VERSION = 1;
  private static readonly HEADER_BYTE_SIZE = 32;

  public static serializeRaw(
    built: BuiltTerrainSpans,
    mapWidth: number,
    mapHeight: number,
  ): Uint8Array {
    const paletteCount = built.palette.length;
    const paletteBytes = paletteCount * 4;
    const gridBytes = built.rawIndexedGrid.byteLength;
    const totalBytes = this.HEADER_BYTE_SIZE + paletteBytes + gridBytes;

    const outputBuffer = new Uint8Array(totalBytes);
    const dataView = new DataView(outputBuffer.buffer);

    dataView.setUint32(0, this.RAW_MAGIC, true);
    dataView.setUint16(4, this.FORMAT_VERSION, true);
    dataView.setUint16(6, mapWidth, true);
    dataView.setUint16(8, mapHeight, true);
    dataView.setUint16(10, paletteCount, true);
    dataView.setUint32(12, this.HEADER_BYTE_SIZE, true);
    dataView.setUint32(16, this.HEADER_BYTE_SIZE + paletteBytes, true);
    dataView.setUint32(20, gridBytes, true);

    let paletteOffset = this.HEADER_BYTE_SIZE;
    for (let i = 0; i < paletteCount; i++) {
      const color = built.palette[i]!;
      outputBuffer[paletteOffset] = color.r;
      outputBuffer[paletteOffset + 1] = color.g;
      outputBuffer[paletteOffset + 2] = color.b;
      outputBuffer[paletteOffset + 3] = 255;
      paletteOffset += 4;
    }

    outputBuffer.set(
      built.rawIndexedGrid,
      this.HEADER_BYTE_SIZE + paletteBytes,
    );
    return outputBuffer;
  }

  public static serializeCompressed(
    built: BuiltTerrainSpans,
    mapWidth: number,
    mapHeight: number,
  ): Uint8Array {
    const paletteCount = built.palette.length;
    const paletteBytes = paletteCount * 4;
    const offsetsBytes = built.rowOffsets.byteLength;
    const spansBytes = built.packedSpans.byteLength;
    const totalBytes =
      this.HEADER_BYTE_SIZE + paletteBytes + offsetsBytes + spansBytes;

    const outputBuffer = new Uint8Array(totalBytes);
    const dataView = new DataView(outputBuffer.buffer);

    dataView.setUint32(0, this.SPANS_MAGIC, true);
    dataView.setUint16(4, this.FORMAT_VERSION, true);
    dataView.setUint16(6, mapWidth, true);
    dataView.setUint16(8, mapHeight, true);
    dataView.setUint16(10, paletteCount, true);
    dataView.setUint32(12, mapHeight, true);
    dataView.setUint32(16, built.totalSpans, true);
    dataView.setUint32(20, this.HEADER_BYTE_SIZE, true);

    let paletteOffset = this.HEADER_BYTE_SIZE;
    for (let i = 0; i < paletteCount; i++) {
      const color = built.palette[i]!;
      outputBuffer[paletteOffset] = color.r;
      outputBuffer[paletteOffset + 1] = color.g;
      outputBuffer[paletteOffset + 2] = color.b;
      outputBuffer[paletteOffset + 3] = 255;
      paletteOffset += 4;
    }

    const offsetsTarget = this.HEADER_BYTE_SIZE + paletteBytes;
    outputBuffer.set(
      new Uint8Array(
        built.rowOffsets.buffer,
        built.rowOffsets.byteOffset,
        built.rowOffsets.byteLength,
      ),
      offsetsTarget,
    );

    const spansTarget = offsetsTarget + offsetsBytes;
    outputBuffer.set(
      new Uint8Array(
        built.packedSpans.buffer,
        built.packedSpans.byteOffset,
        built.packedSpans.byteLength,
      ),
      spansTarget,
    );

    return outputBuffer;
  }
}
