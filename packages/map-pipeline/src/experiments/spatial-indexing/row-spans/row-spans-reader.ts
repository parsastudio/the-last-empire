export class RowSpansReader {
  private static readonly HEADER_BYTE_SIZE = 24;

  private mapWidth: number;
  private mapHeight: number;
  private totalRows: number;
  private totalSpans: number;
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
    if (magic !== 0x5253504e) {
      throw new Error("Invalid RowSpans binary header signature.");
    }

    this.mapWidth = dataView.getUint16(6, true);
    this.mapHeight = dataView.getUint16(8, true);
    this.totalRows = dataView.getUint32(12, true);
    this.totalSpans = dataView.getUint32(16, true);

    const offsetsOffset = view.byteOffset + RowSpansReader.HEADER_BYTE_SIZE;
    this.rowOffsets = new Uint32Array(
      view.buffer,
      offsetsOffset,
      this.totalRows + 1,
    );

    const spansOffset =
      offsetsOffset + (this.totalRows + 1) * Uint32Array.BYTES_PER_ELEMENT;
    this.packedSpans = new Uint32Array(
      view.buffer,
      spansOffset,
      this.totalSpans,
    );
  }

  public getProvinceId(x: number, y: number): number {
    const clampedX = Math.floor(x);
    const clampedY = Math.floor(y);

    if (
      clampedX < 0 ||
      clampedX >= this.mapWidth ||
      clampedY < 0 ||
      clampedY >= this.mapHeight
    ) {
      return 0;
    }

    const startIdx = this.rowOffsets[clampedY]!;
    const endIdx = this.rowOffsets[clampedY + 1]!;

    if (startIdx >= endIdx) {
      return 0;
    }

    let low = startIdx;
    let high = endIdx - 1;
    let result = 0;

    while (low <= high) {
      const mid = (low + high) >>> 1;
      const span = this.packedSpans[mid]!;
      const spanEnd = span >>> 16;

      if (clampedX <= spanEnd) {
        result = span & 0xffff;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return result;
  }
}
