import zlib from "zlib";
import fs from "fs/promises";

export class PngDecoder {
  public static async decodeIndexedPng(
    input: string | Buffer,
    width = 4096,
    height = 2048,
  ): Promise<{ width: number; height: number; buffer: Uint8Array } | null> {
    try {
      let fileBuf: Buffer;
      if (typeof input === "string") {
        fileBuf = await fs.readFile(input);
      } else {
        fileBuf = input;
      }

      if (
        fileBuf[0] !== 0x89 ||
        fileBuf[1] !== 0x50 ||
        fileBuf[2] !== 0x4e ||
        fileBuf[3] !== 0x47
      ) {
        return null;
      }

      const idatChunks: Buffer[] = [];
      let pos = 8;
      while (pos < fileBuf.length) {
        if (pos + 8 > fileBuf.length) break;
        const length = fileBuf.readUInt32BE(pos);
        const type = fileBuf.toString("ascii", pos + 4, pos + 8);
        pos += 8;
        if (pos + length > fileBuf.length) break;
        if (type === "IDAT") {
          idatChunks.push(fileBuf.subarray(pos, pos + length));
        } else if (type === "IEND") {
          break;
        }
        pos += length + 4;
      }

      if (idatChunks.length === 0) {
        return null;
      }

      const compressedIdat = Buffer.concat(idatChunks);
      const decompressed = zlib.inflateSync(compressedIdat);
      const scanlineSize = width + 1;

      if (decompressed.length !== height * scanlineSize) {
        return null;
      }

      const rawPixels = new Uint8Array(width * height);
      for (let y = 0; y < height; y++) {
        const srcPos = y * scanlineSize + 1;
        const destPos = y * width;
        rawPixels.set(decompressed.subarray(srcPos, srcPos + width), destPos);
      }

      return { width, height, buffer: rawPixels };
    } catch {
      return null;
    }
  }
}
