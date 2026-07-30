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

    const pixelIdx = y * width + x;

    let idLeft = id;
    if (x > 2) {
      const leftIdx = pixelIdx - 2;
      idLeft = maskData[leftIdx] || 0;
      if (dynamicIds && dynamicIds[leftIdx]! > 0) {
        idLeft = dynamicIds[leftIdx]!;
      }
    }

    let idTop = id;
    if (y > 2) {
      const topIdx = pixelIdx - width * 2;
      idTop = maskData[topIdx] || 0;
      if (dynamicIds && dynamicIds[topIdx]! > 0) {
        idTop = dynamicIds[topIdx]!;
      }
    }

    let idRight = id;
    if (x < width - 2) {
      const rightIdx = pixelIdx + 2;
      idRight = maskData[rightIdx] || 0;
      if (dynamicIds && dynamicIds[rightIdx]! > 0) {
        idRight = dynamicIds[rightIdx]!;
      }
    }

    let idBottom = id;
    if (y < height - 2) {
      const bottomIdx = pixelIdx + width * 2;
      idBottom = maskData[bottomIdx] || 0;
      if (dynamicIds && dynamicIds[bottomIdx]! > 0) {
        idBottom = dynamicIds[bottomIdx]!;
      }
    }

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
