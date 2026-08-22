import { BitPackedCellUtility } from "@geopolitics/domain";

export class MaritimeWaterGridBuilder {
  public static readonly SCALE_FACTOR = 4;
  public static readonly TOPOLOGY_WIDTH = 1024;
  public static readonly TOPOLOGY_HEIGHT = 512;

  public static buildTopologyGrid(
    highResGrid: Uint16Array,
    highResWidth = 4096,
    highResHeight = 2048,
  ): Uint16Array {
    const targetWidth = MaritimeWaterGridBuilder.TOPOLOGY_WIDTH;
    const targetHeight = MaritimeWaterGridBuilder.TOPOLOGY_HEIGHT;
    const topologyGrid = new Uint16Array(targetWidth * targetHeight);
    const factor = MaritimeWaterGridBuilder.SCALE_FACTOR;

    for (let ty = 0; ty < targetHeight; ty++) {
      const baseHy = ty * factor;
      const targetRowOffset = ty * targetWidth;

      for (let tx = 0; tx < targetWidth; tx++) {
        const baseHx = tx * factor;
        let hasOceanWater = false;
        let dominantPid = 0;
        const counts = new Map<number, number>();

        for (let dy = 0; dy < factor; dy++) {
          const hy = baseHy + dy;
          if (hy >= highResHeight) continue;
          const highRowOffset = hy * highResWidth;

          for (let dx = 0; dx < factor; dx++) {
            const hx = baseHx + dx;
            if (hx >= highResWidth) continue;

            const cell = highResGrid[highRowOffset + hx]! & 0x0fff;

            if (cell === BitPackedCellUtility.WATER_OCEAN_ID) {
              hasOceanWater = true;
              break;
            }

            if (cell >= BitPackedCellUtility.FIRST_PROVINCE_ID) {
              const cur = (counts.get(cell) || 0) + 1;
              counts.set(cell, cur);
              if (cur > (counts.get(dominantPid) || 0)) {
                dominantPid = cell;
              }
            }
          }

          if (hasOceanWater) break;
        }

        if (hasOceanWater) {
          topologyGrid[targetRowOffset + tx] =
            BitPackedCellUtility.WATER_OCEAN_ID;
        } else {
          topologyGrid[targetRowOffset + tx] = dominantPid;
        }
      }
    }

    return topologyGrid;
  }
}
