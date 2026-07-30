import zlib from "zlib";
import fs from "fs/promises";

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
      const idatChunks: Buffer[] = [];

      while (pos < fileBuf.length) {
        const length = fileBuf.readUInt32BE(pos);
        const type = fileBuf.toString("ascii", pos + 4, pos + 8);
        if (type === "IHDR") {
          width = fileBuf.readUInt32BE(pos + 8);
          height = fileBuf.readUInt32BE(pos + 12);
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

      const pixelBuffer = new Uint8Array(width * height);
      const stride = width + 1;

      for (let y = 0; y < height; y++) {
        const lineStart = y * stride + 1;
        for (let x = 0; x < width; x++) {
          pixelBuffer[y * width + x] = decompressed[lineStart + x] || 0;
        }
      }

      return { width, height, buffer: pixelBuffer };
    } catch {
      return null;
    }
  }
}
