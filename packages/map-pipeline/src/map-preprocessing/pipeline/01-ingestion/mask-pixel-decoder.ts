import { PNG } from "pngjs";

export class MaskPixelDecoder {
  public static decodeNationGrid(
    png: PNG,
    width: number,
    height: number,
  ): Uint8Array {
    const rawNationGrid = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const r = png.data[idx]!;
        const g = png.data[idx + 1]!;
        const b = png.data[idx + 2]!;

        let nationId = 0;
        if (b >= 11 && b < 250) {
          nationId = b;
        } else if (r >= 11 && r < 250) {
          nationId = r;
        } else if (g >= 11 && g < 250) {
          nationId = g;
        }

        rawNationGrid[y * width + x] = nationId;
      }
    }

    return rawNationGrid;
  }
}
