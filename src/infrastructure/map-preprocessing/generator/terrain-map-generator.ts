import fs from "fs/promises";
import { PNG } from "pngjs";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class TerrainMapGenerator {
  private static computeOceanDistanceField(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
  ): Uint16Array {
    const totalPixels = width * height;
    const dist = new Uint16Array(totalPixels);
    dist.fill(65535);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const val = assignmentGrid[idx]!;
        if (
          val !== BitPackedCellUtility.WATER_OCEAN_ID &&
          val !== BitPackedCellUtility.WATER_LAKE_ID &&
          val !== 0
        ) {
          dist[idx] = 0;
          continue;
        }

        let isAdjacentToLand = false;
        const leftX = (x - 1 + width) % width;
        const rightX = (x + 1) % width;

        if (y > 0) {
          const topVal = assignmentGrid[(y - 1) * width + x]!;
          if (
            topVal !== BitPackedCellUtility.WATER_OCEAN_ID &&
            topVal !== BitPackedCellUtility.WATER_LAKE_ID &&
            topVal !== 0
          ) {
            isAdjacentToLand = true;
          }
        }
        if (y < height - 1) {
          const btmVal = assignmentGrid[(y + 1) * width + x]!;
          if (
            btmVal !== BitPackedCellUtility.WATER_OCEAN_ID &&
            btmVal !== BitPackedCellUtility.WATER_LAKE_ID &&
            btmVal !== 0
          ) {
            isAdjacentToLand = true;
          }
        }
        const lVal = assignmentGrid[rowOffset + leftX]!;
        if (
          lVal !== BitPackedCellUtility.WATER_OCEAN_ID &&
          lVal !== BitPackedCellUtility.WATER_LAKE_ID &&
          lVal !== 0
        ) {
          isAdjacentToLand = true;
        }
        const rVal = assignmentGrid[rowOffset + rightX]!;
        if (
          rVal !== BitPackedCellUtility.WATER_OCEAN_ID &&
          rVal !== BitPackedCellUtility.WATER_LAKE_ID &&
          rVal !== 0
        ) {
          isAdjacentToLand = true;
        }

        if (isAdjacentToLand) {
          dist[idx] = 1;
        }
      }
    }

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (dist[idx]! <= 1) continue;

        let minD = dist[idx]!;
        const leftX = (x - 1 + width) % width;

        const leftD = dist[rowOffset + leftX]! + 1;
        if (leftD < minD) minD = leftD;

        if (y > 0) {
          const topRow = (y - 1) * width;
          const topD = dist[topRow + x]! + 1;
          if (topD < minD) minD = topD;

          const topLeftD = dist[topRow + leftX]! + 2;
          if (topLeftD < minD) minD = topLeftD;

          const rightX = (x + 1) % width;
          const topRightD = dist[topRow + rightX]! + 2;
          if (topRightD < minD) minD = topRightD;
        }

        dist[idx] = Math.min(65535, minD);
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      const rowOffset = y * width;
      for (let x = width - 1; x >= 0; x--) {
        const idx = rowOffset + x;
        if (dist[idx]! <= 1) continue;

        let minD = dist[idx]!;
        const rightX = (x + 1) % width;

        const rightD = dist[rowOffset + rightX]! + 1;
        if (rightD < minD) minD = rightD;

        if (y < height - 1) {
          const btmRow = (y + 1) * width;
          const btmD = dist[btmRow + x]! + 1;
          if (btmD < minD) minD = btmD;

          const btmRightD = dist[btmRow + rightX]! + 2;
          if (btmRightD < minD) minD = btmRightD;

          const leftX = (x - 1 + width) % width;
          const btmLeftD = dist[btmRow + leftX]! + 2;
          if (btmLeftD < minD) minD = btmLeftD;
        }

        dist[idx] = Math.min(65535, minD);
      }
    }

    return dist;
  }

  private static calculateOceanPixelColor(
    distance: number,
    isLake: boolean,
  ): [number, number, number] {
    if (isLake) {
      if (distance <= 2) return [110, 155, 185];
      if (distance <= 6) return [75, 115, 145];
      return [52, 85, 115];
    }

    if (distance === 1) return [195, 230, 242];
    if (distance === 2) return [165, 210, 230];
    if (distance === 3) return [135, 188, 215];
    if (distance === 4) return [110, 168, 200];
    if (distance <= 8) {
      const t = (distance - 4) / 4;
      return [
        Math.round(110 + t * (75 - 110)),
        Math.round(168 + t * (125 - 168)),
        Math.round(200 + t * (165 - 200)),
      ];
    }
    if (distance <= 20) {
      const t = (distance - 8) / 12;
      return [
        Math.round(75 + t * (40 - 75)),
        Math.round(125 + t * (75 - 125)),
        Math.round(165 + t * (115 - 165)),
      ];
    }
    if (distance <= 50) {
      const t = (distance - 20) / 30;
      return [
        Math.round(40 + t * (20 - 40)),
        Math.round(75 + t * (38 - 75)),
        Math.round(115 + t * (68 - 115)),
      ];
    }

    const t = Math.min(1.0, (distance - 50) / 100);
    let r = Math.round(20 + t * (12 - 20));
    let g = Math.round(38 + t * (22 - 38));
    let b = Math.round(68 + t * (42 - 68));

    if (distance > 10 && distance % 16 === 0) {
      r = Math.min(255, r + 6);
      g = Math.min(255, g + 8);
      b = Math.min(255, b + 10);
    }

    return [r, g, b];
  }

  public static async generateAndSave(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    outputPath: string,
  ): Promise<void> {
    const distField = this.computeOceanDistanceField(
      assignmentGrid,
      width,
      height,
    );
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const outIdx = idx << 2;
        const gridVal = assignmentGrid[idx]!;

        const isLand =
          gridVal !== BitPackedCellUtility.WATER_OCEAN_ID &&
          gridVal !== BitPackedCellUtility.WATER_LAKE_ID &&
          gridVal !== 0;

        if (isLand) {
          png.data[outIdx] = 255;
          png.data[outIdx + 1] = 255;
          png.data[outIdx + 2] = 255;
          png.data[outIdx + 3] = 255;
        } else {
          const isLake = gridVal === BitPackedCellUtility.WATER_LAKE_ID;
          const dist = distField[idx] || 1;
          const [r, g, b] = this.calculateOceanPixelColor(dist, isLake);

          png.data[outIdx] = r;
          png.data[outIdx + 1] = g;
          png.data[outIdx + 2] = b;
          png.data[outIdx + 3] = 255;
        }
      }
    }

    const pngBuffer = PNG.sync.write(png);
    await fs.writeFile(outputPath, pngBuffer);
  }
}
