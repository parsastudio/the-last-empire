import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class WaterBodyClassifier {
  public normalizeWater(buffer: BitPackedBuffer): void {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = buffer.getNationId(x, y);
        if (
          nationId < MAP_CONFIG.MIN_NATION_ID ||
          nationId >= MAP_CONFIG.MAX_NATION_ID
        ) {
          buffer.setNationId(x, y, MAP_CONFIG.WATER_NATION_ID);
        }
      }
    }
  }

  public classifyWaterBodies(
    buffer: BitPackedBuffer,
    threshold = MAP_CONFIG.CLOSED_WATER_THRESHOLD,
  ): void {
    const width = buffer.getWidth();
    const height = buffer.getHeight();
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    const queue = new Int32Array(totalPixels);

    for (let startIdx = 0; startIdx < totalPixels; startIdx++) {
      if (visited[startIdx] === 1) continue;

      const startX = startIdx % width;
      const startY = Math.floor(startIdx / width);

      if (buffer.getNationId(startX, startY) !== MAP_CONFIG.WATER_NATION_ID) {
        visited[startIdx] = 1;
        continue;
      }

      let head = 0;
      let tail = 0;

      queue[tail++] = startIdx;
      visited[startIdx] = 1;

      while (head < tail) {
        const currIdx = queue[head++]!;
        const cx = currIdx % width;
        const cy = Math.floor(currIdx / width);

        for (let k = 0; k < 4; k++) {
          const nx = (cx + neighbors[k]!.dx + width) % width;
          const ny = cy + neighbors[k]!.dy;

          if (ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (
              visited[nIdx] === 0 &&
              buffer.getNationId(nx, ny) === MAP_CONFIG.WATER_NATION_ID
            ) {
              visited[nIdx] = 1;
              queue[nIdx] = 1;
              queue[tail++] = nIdx;
            }
          }
        }
      }

      const componentSize = tail;
      const waterType =
        componentSize > threshold
          ? BitPackedCellUtility.COASTAL_OPEN_WATER
          : BitPackedCellUtility.COASTAL_CLOSED_WATER;

      for (let i = 0; i < componentSize; i++) {
        const pIdx = queue[i]!;
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);
        buffer.setCoastalAccess(px, py, waterType);
      }
    }
  }

  public classifyCoastalLand(buffer: BitPackedBuffer): void {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = buffer.getNationId(x, y);

        if (
          nationId < MAP_CONFIG.MIN_NATION_ID ||
          nationId >= MAP_CONFIG.MAX_NATION_ID
        ) {
          continue;
        }

        let hasOpenWater = false;
        let hasClosedWater = false;

        for (let k = 0; k < 8; k++) {
          const nx = (x + neighbors[k]!.dx + width) % width;
          const ny = y + neighbors[k]!.dy;

          if (ny >= 0 && ny < height) {
            if (buffer.getNationId(nx, ny) === MAP_CONFIG.WATER_NATION_ID) {
              const accessType = buffer.getCoastalAccess(nx, ny);
              if (accessType === BitPackedCellUtility.COASTAL_OPEN_WATER) {
                hasOpenWater = true;
                break;
              }
              if (accessType === BitPackedCellUtility.COASTAL_CLOSED_WATER) {
                hasClosedWater = true;
              }
            }
          }
        }

        if (hasOpenWater) {
          buffer.setCoastalAccess(
            x,
            y,
            BitPackedCellUtility.COASTAL_OPEN_WATER,
          );
        } else if (hasClosedWater) {
          buffer.setCoastalAccess(
            x,
            y,
            BitPackedCellUtility.COASTAL_CLOSED_WATER,
          );
        } else {
          buffer.setCoastalAccess(x, y, BitPackedCellUtility.COASTAL_NONE);
        }
      }
    }
  }

  public processFullMap(buffer: BitPackedBuffer): void {
    this.normalizeWater(buffer);
    this.classifyWaterBodies(buffer);
    this.classifyCoastalLand(buffer);
  }
}
