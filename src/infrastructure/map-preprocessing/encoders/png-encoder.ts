import zlib from "zlib";

export class PngEncoder {
  public static encodeRgbPng(
    width: number,
    height: number,
    rgbBuffer: Uint8Array,
  ): Buffer {
    const rowSize = width * 3;
    const rawData = new Uint8Array(height * (rowSize + 1));

    for (let y = 0; y < height; y++) {
      const srcOffset = y * rowSize;
      const destOffset = y * (rowSize + 1);
      rawData[destOffset] = 0;
      rawData.set(
        rgbBuffer.subarray(srcOffset, srcOffset + rowSize),
        destOffset + 1,
      );
    }

    const compressedData = zlib.deflateSync(Buffer.from(rawData.buffer));

    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 2;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const ihdrChunk = PngEncoder.createChunk("IHDR", ihdr);
    const idatChunk = PngEncoder.createChunk("IDAT", compressedData);
    const iendChunk = PngEncoder.createChunk("IEND", Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  }

  private static createChunk(type: string, data: Buffer): Buffer {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, "ascii");
    data.copy(buf, 8);

    const crcVal = PngEncoder.crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal >>> 0, 8 + len);
    return buf;
  }

  private static crc32Table: Uint32Array | null = null;

  private static getCrcTable(): Uint32Array {
    if (this.crc32Table) return this.crc32Table;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    this.crc32Table = table;
    return table;
  }

  private static crc32(buf: Buffer): number {
    const table = PngEncoder.getCrcTable();
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      const b = buf[i]!;
      crc = table[(crc ^ b) & 0xff]! ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}
