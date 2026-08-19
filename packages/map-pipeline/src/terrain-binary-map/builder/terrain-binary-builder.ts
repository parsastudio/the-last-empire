import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import {
  BuiltTerrainSpans,
  TerrainColorRGB,
} from "@/infrastructure/terrain-binary-map/core/terrain-binary-types";

export class TerrainBinaryBuilder {
  public static build(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
  ): BuiltTerrainSpans {
    const distField = this.computeOceanDistanceField(
      assignmentGrid,
      width,
      height,
    );
    const totalPixels = width * height;
    const rawIndexedGrid = new Uint8Array(totalPixels);

    const palette: TerrainColorRGB[] = [];
    const colorToIndexMap = new Map<number, number>();

    const getOrAddColor = (r: number, g: number, b: number): number => {
      const key = (r << 16) | (g << 8) | b;
      let idx = colorToIndexMap.get(key);
      if (idx === undefined) {
        idx = palette.length;
        palette.push({ r, g, b });
        colorToIndexMap.set(key, idx);
      }
      return idx;
    };

    getOrAddColor(255, 255, 255);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const gridVal = assignmentGrid[idx]!;

        const isLand =
          gridVal !== BitPackedCellUtility.WATER_OCEAN_ID &&
          gridVal !== BitPackedCellUtility.WATER_LAKE_ID &&
          gridVal !== 0;

        if (isLand) {
          rawIndexedGrid[idx] = 0;
        } else {
          const isLake = gridVal === BitPackedCellUtility.WATER_LAKE_ID;
          const dist = distField[idx] || 1.0;
          const [r, g, b] = this.calculateZoneOceanColor(dist, isLake);
          rawIndexedGrid[idx] = getOrAddColor(r, g, b);
        }
      }
    }

    const rowOffsets = new Uint32Array(height + 1);
    const spansList: number[] = [];
    let minSpans = Infinity;
    let maxSpans = 0;

    for (let y = 0; y < height; y++) {
      rowOffsets[y] = spansList.length;
      const rowOffset = y * width;

      let currentColor = rawIndexedGrid[rowOffset]!;
      let rowSpanCount = 0;

      for (let x = 1; x < width; x++) {
        const c = rawIndexedGrid[rowOffset + x]!;
        if (c !== currentColor) {
          const packed = (((x - 1) & 0xffff) << 16) | (currentColor & 0xffff);
          spansList.push(packed >>> 0);
          rowSpanCount++;
          currentColor = c;
        }
      }

      const lastPacked =
        (((width - 1) & 0xffff) << 16) | (currentColor & 0xffff);
      spansList.push(lastPacked >>> 0);
      rowSpanCount++;

      if (rowSpanCount < minSpans) minSpans = rowSpanCount;
      if (rowSpanCount > maxSpans) maxSpans = rowSpanCount;
    }

    rowOffsets[height] = spansList.length;
    const packedSpans = new Uint32Array(spansList);

    return {
      palette,
      rawIndexedGrid,
      rowOffsets,
      packedSpans,
      minSpansPerRow: minSpans === Infinity ? 0 : minSpans,
      maxSpansPerRow: maxSpans,
      totalSpans: spansList.length,
    };
  }

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

  private static calculateZoneOceanColor(
    distance: number,
    isLake: boolean,
  ): [number, number, number] {
    if (isLake) {
      if (distance <= 4.0) {
        return [22, 36, 50];
      }
      return [14, 24, 36];
    }

    if (distance <= 4.0) {
      return [26, 48, 68];
    }
    if (distance <= 14.0) {
      return [18, 32, 48];
    }
    return [9, 15, 24];
  }
}
