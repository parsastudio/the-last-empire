import zlib from "zlib";

export class PngDecoder {
  public decodeOurIndexedPng(
    pngBuffer: Buffer,
    width = 4096,
    height = 2048,
  ): Uint8Array {
    if (
      pngBuffer[0] !== 0x89 ||
      pngBuffer[1] !== 0x50 ||
      pngBuffer[2] !== 0x4e ||
      pngBuffer[3] !== 0x47
    ) {
      throw new Error("Invalid PNG signature");
    }
    const idatChunks: Buffer[] = [];
    let pos = 8;
    while (pos < pngBuffer.length) {
      if (pos + 8 > pngBuffer.length) break;
      const length = pngBuffer.readUInt32BE(pos);
      const type = pngBuffer.toString("ascii", pos + 4, pos + 8);
      pos += 8;
      if (pos + length > pngBuffer.length) break;
      if (type === "IDAT") {
        idatChunks.push(pngBuffer.subarray(pos, pos + length));
      } else if (type === "IEND") {
        break;
      }
      pos += length + 4;
    }
    if (idatChunks.length === 0) {
      throw new Error("No IDAT chunk found in PNG");
    }
    const compressedIdat = Buffer.concat(idatChunks);
    const decompressed = zlib.inflateSync(compressedIdat);
    const scanlineSize = width + 1;
    if (decompressed.length !== height * scanlineSize) {
      throw new Error("Unexpected decompressed size");
    }
    const rawPixels = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      const srcPos = y * scanlineSize + 1;
      const destPos = y * width;
      rawPixels.set(decompressed.subarray(srcPos, srcPos + width), destPos);
    }
    return rawPixels;
  }
}
