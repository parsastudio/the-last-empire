import { ColorPair } from "./country-palette-generator";

export class MapBevelShader {
  public calculateBevel(
    r: number,
    g: number,
    b: number,
    pair: ColorPair,
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    srcData: Uint8ClampedArray,
  ): { r: number; g: number; b: number } {
    const idx = (y * width + x) * 4;
    const ratio = (x / width + y / height) * 0.5;
    const invRatio = 1.0 - ratio;

    let finalR = Math.floor(pair.r1 * invRatio + pair.r2 * ratio);
    let finalG = Math.floor(pair.g1 * invRatio + pair.g2 * ratio);
    let finalB = Math.floor(pair.b1 * invRatio + pair.b2 * ratio);

    const idLeft = x > 2 ? srcData[idx - 8 + 2] || 0 : id;
    const idTop = y > 2 ? srcData[idx - width * 8 + 2] || 0 : id;
    const idRight = x < width - 2 ? srcData[idx + 8 + 2] || 0 : id;
    const idBottom = y < height - 2 ? srcData[idx + width * 8 + 2] || 0 : id;

    let bevel = 1.0;
    if (idLeft !== id || idTop !== id) {
      bevel += 0.02;
    }
    if (idRight !== id || idBottom !== id) {
      bevel -= 0.02;
    }

    return {
      r: Math.floor(finalR * bevel),
      g: Math.floor(finalG * bevel),
      b: Math.floor(finalB * bevel),
    };
  }
}
