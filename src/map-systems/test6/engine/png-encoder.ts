import zlib from "zlib";

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function writeChunk(chunks: Buffer[], type: string, data: Buffer) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcContent = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcContent);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  chunks.push(len, typeBuf, data, crcBuf);
}

export function encodePng(
  width: number,
  height: number,
  indexedData: Uint8Array,
  palette: [number, number, number][],
): Buffer {
  const chunks: Buffer[] = [];
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 3;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  writeChunk(chunks, "IHDR", ihdr);

  const plte = Buffer.alloc(palette.length * 3);
  for (let i = 0; i < palette.length; i++) {
    const color = palette[i];
    if (color) {
      plte[i * 3] = color[0];
      plte[i * 3 + 1] = color[1];
      plte[i * 3 + 2] = color[2];
    }
  }
  writeChunk(chunks, "PLTE", plte);

  const scanlineSize = width + 1;
  const idatRaw = Buffer.alloc(height * scanlineSize);
  for (let y = 0; y < height; y++) {
    idatRaw[y * scanlineSize] = 0;
    for (let x = 0; x < width; x++) {
      idatRaw[y * scanlineSize + 1 + x] = indexedData[y * width + x] || 0;
    }
  }
  const compressed = zlib.deflateSync(idatRaw);
  writeChunk(chunks, "IDAT", compressed);

  writeChunk(chunks, "IEND", Buffer.alloc(0));
  return Buffer.concat(chunks);
}
