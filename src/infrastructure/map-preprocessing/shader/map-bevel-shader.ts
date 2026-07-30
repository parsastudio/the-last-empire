import { ColorPair } from "./country-palette-generator";

export class MapBevelShader {
  public calculateBevel(
    pair: ColorPair,
    x: number,
    y: number,
    width: number,
    height: number,
    id: number,
    maskData: Uint8Array,
    dynamicIds?: Uint16Array | null,
  ): { r: number; g: number; b: number } {
    const ratio = (x / width + y / height) * 0.5;
    const invRatio = 1.0 - ratio;

    const finalR = Math.floor(pair.r1 * invRatio + pair.r2 * ratio);
    const finalG = Math.floor(pair.g1 * invRatio + pair.g2 * ratio);
    const finalB = Math.floor(pair.b1 * invRatio + pair.b2 * ratio);

    const getOwner = (px: number, py: number): number => {
      const pIdx = py * width + px;
      if (dynamicIds && dynamicIds[pIdx]! > 0) {
        return dynamicIds[pIdx]!;
      }
      return maskData[pIdx] || 0;
    };

    const idLeft = x > 2 ? getOwner(x - 2, y) : id;
    const idTop = y > 2 ? getOwner(x, y - 2) : id;
    const idRight = x < width - 2 ? getOwner(x + 2, y) : id;
    const idBottom = y < height - 2 ? getOwner(x + 2, y) : id;

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
