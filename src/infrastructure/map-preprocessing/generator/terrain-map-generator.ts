import fs from "fs/promises";
import { PNG } from "pngjs";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class TerrainMapGenerator {
  private static computeOceanDistanceField(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
  ): Float32Array {
    const totalPixels = width * height;
    const dist = new Float32Array(totalPixels);
    dist.fill(1e6);

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
          dist[idx] = 1.0;
        }
      }
    }

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (dist[idx]! <= 1.0) continue;

        let minD = dist[idx]!;
        const leftX = (x - 1 + width) % width;

        const leftD = dist[rowOffset + leftX]! + 1.0;
        if (leftD < minD) minD = leftD;

        if (y > 0) {
          const topRow = (y - 1) * width;
          const topD = dist[topRow + x]! + 1.0;
          if (topD < minD) minD = topD;

          const topLeftD = dist[topRow + leftX]! + 1.414;
          if (topLeftD < minD) minD = topLeftD;

          const rightX = (x + 1) % width;
          const topRightD = dist[topRow + rightX]! + 1.414;
          if (topRightD < minD) minD = topRightD;
        }

        dist[idx] = minD;
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      const rowOffset = y * width;
      for (let x = width - 1; x >= 0; x--) {
        const idx = rowOffset + x;
        if (dist[idx]! <= 1.0) continue;

        let minD = dist[idx]!;
        const rightX = (x + 1) % width;

        const rightD = dist[rowOffset + rightX]! + 1.0;
        if (rightD < minD) minD = rightD;

        if (y < height - 1) {
          const btmRow = (y + 1) * width;
          const btmD = dist[btmRow + x]! + 1.0;
          if (btmD < minD) minD = btmD;

          const btmRightD = dist[btmRow + rightX]! + 1.414;
          if (btmRightD < minD) minD = btmRightD;

          const leftX = (x - 1 + width) % width;
          const btmLeftD = dist[btmRow + leftX]! + 1.414;
          if (btmLeftD < minD) minD = btmLeftD;
        }

        dist[idx] = minD;
      }
    }

    return dist;
  }

  private static calculateOceanPixelColor(
    distance: number,
    isLake: boolean,
  ): [number, number, number] {
    if (isLake) {
      const factor = Math.exp(-Math.max(0, distance - 1.0) / 8.0);
      const r = Math.round(14 + factor * (22 - 14));
      const g = Math.round(24 + factor * (36 - 24));
      const b = Math.round(36 + factor * (50 - 36));
      return [r, g, b];
    }

    const factor = Math.exp(-Math.max(0, distance - 1.0) / 16.0);
    const r = Math.round(9 + factor * (26 - 9));
    const g = Math.round(15 + factor * (48 - 15));
    const b = Math.round(24 + factor * (68 - 24));

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
          const dist = distField[idx] || 1.0;
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
