import zlib from "zlib";
import fs from "fs/promises";

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export class PngDecoder {
  public static async decodeIndexedPng(
    filePath: string,
  ): Promise<{ width: number; height: number; buffer: Uint8Array } | null> {
    try {
      const fileBuf = await fs.readFile(filePath);
      if (fileBuf.length < 8) return null;

      let pos = 8;
      let width = 0;
      let height = 0;
      let colorType = 3;
      const idatChunks: Buffer[] = [];

      while (pos + 8 <= fileBuf.length) {
        const length = fileBuf.readUInt32BE(pos);
        const type = fileBuf.toString("ascii", pos + 4, pos + 8);
        if (type === "IHDR") {
          width = fileBuf.readUInt32BE(pos + 8);
          height = fileBuf.readUInt32BE(pos + 12);
          colorType = fileBuf[pos + 17] || 3;
        } else if (type === "IDAT") {
          idatChunks.push(fileBuf.subarray(pos + 8, pos + 8 + length));
        } else if (type === "IEND") {
          break;
        }
        pos += 12 + length;
      }

      if (width === 0 || height === 0 || idatChunks.length === 0) {
        return null;
      }

      const compressed = Buffer.concat(idatChunks);
      const decompressed = zlib.inflateSync(compressed);

      let bpp = 1;
      if (colorType === 2) bpp = 3;
      else if (colorType === 6) bpp = 4;
      else if (colorType === 0) bpp = 1;
      else if (colorType === 3) bpp = 1;

      const rowBytes = width * bpp;
      const stride = rowBytes + 1;
      const unfiltered = new Uint8Array(height * rowBytes);

      for (let y = 0; y < height; y++) {
        const filterType = decompressed[y * stride] || 0;
        const scanlineOffset = y * stride + 1;
        const outOffset = y * rowBytes;
        const priorOffset = (y - 1) * rowBytes;

        for (let x = 0; x < rowBytes; x++) {
          const raw = decompressed[scanlineOffset + x] || 0;
          const a = x >= bpp ? unfiltered[outOffset + x - bpp]! : 0;
          const b = y > 0 ? unfiltered[priorOffset + x]! : 0;
          const c = x >= bpp && y > 0 ? unfiltered[priorOffset + x - bpp]! : 0;

          let val = 0;
          if (filterType === 0) {
            val = raw;
          } else if (filterType === 1) {
            val = (raw + a) & 0xff;
          } else if (filterType === 2) {
            val = (raw + b) & 0xff;
          } else if (filterType === 3) {
            val = (raw + Math.floor((a + b) / 2)) & 0xff;
          } else if (filterType === 4) {
            val = (raw + paethPredictor(a, b, c)) & 0xff;
          } else {
            val = raw;
          }

          unfiltered[outOffset + x] = val;
        }
      }

      const pixelBuffer = new Uint8Array(width * height);

      for (let y = 0; y < height; y++) {
        const rowStart = y * rowBytes;
        for (let x = 0; x < width; x++) {
          const p = rowStart + x * bpp;
          if (colorType === 6 || colorType === 2) {
            const blue = unfiltered[p + 2] || 0;
            const red = unfiltered[p] || 0;
            pixelBuffer[y * width + x] = blue > 0 ? blue : red;
          } else {
            pixelBuffer[y * width + x] = unfiltered[p] || 0;
          }
        }
      }

      return { width, height, buffer: pixelBuffer };
    } catch {
      return null;
    }
  }
}
