import {
  BuiltRowSpans,
  RowSpansBuildStats,
} from "@/infrastructure/strategic-pipeline/06-spatial-indexing/row-spans/row-spans-types";

export class RowSpansSerializer {
  private static readonly MAGIC_NUMBER = 0x5253504e;
  private static readonly FORMAT_VERSION = 1;
  private static readonly HEADER_BYTE_SIZE = 24;

  public static serialize(
    built: BuiltRowSpans,
    mapWidth: number,
    mapHeight: number,
  ): { buffer: Uint8Array; stats: RowSpansBuildStats } {
    const offsetsByteSize = built.rowOffsets.byteLength;
    const spansByteSize = built.packedSpans.byteLength;
    const totalBytes = this.HEADER_BYTE_SIZE + offsetsByteSize + spansByteSize;

    const outputBuffer = new Uint8Array(totalBytes);
    const dataView = new DataView(outputBuffer.buffer);

    dataView.setUint32(0, this.MAGIC_NUMBER, true);
    dataView.setUint16(4, this.FORMAT_VERSION, true);
    dataView.setUint16(6, mapWidth, true);
    dataView.setUint16(8, mapHeight, true);
    dataView.setUint16(10, 0, true);
    dataView.setUint32(12, mapHeight, true);
    dataView.setUint32(16, built.totalSpans, true);
    dataView.setUint32(20, this.HEADER_BYTE_SIZE, true);

    outputBuffer.set(
      new Uint8Array(
        built.rowOffsets.buffer,
        built.rowOffsets.byteOffset,
        built.rowOffsets.byteLength,
      ),
      this.HEADER_BYTE_SIZE,
    );

    outputBuffer.set(
      new Uint8Array(
        built.packedSpans.buffer,
        built.packedSpans.byteOffset,
        built.packedSpans.byteLength,
      ),
      this.HEADER_BYTE_SIZE + offsetsByteSize,
    );

    const originalSizeBytes = mapWidth * mapHeight * 2;
    const compressedSizeBytes = totalBytes;
    const ratio = Number(
      (
        ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) *
        100
      ).toFixed(2),
    );

    const stats: RowSpansBuildStats = {
      originalSizeBytes,
      compressedSizeBytes,
      compressionRatioPercent: ratio,
      totalSpansCount: built.totalSpans,
      minSpansPerRow: built.minSpansPerRow,
      maxSpansPerRow: built.maxSpansPerRow,
      avgSpansPerRow: Number((built.totalSpans / mapHeight).toFixed(2)),
      totalRows: mapHeight,
    };

    return { buffer: outputBuffer, stats };
  }
}
