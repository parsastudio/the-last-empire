import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export interface LandPartitionResult {
  activeCountryIds: Set<number>;
  pixelAreaMap: Map<number, number>;
  consolidatedNationGrid: Uint8Array;
}

export class LandPartitionEngine {
  private static readonly MAX_ISLAND_DISTANCE = 105;

  public static partitionAndConsolidate(
    rawNationGrid: Uint8Array,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
  ): LandPartitionResult {
    const validNationIds = new Set<number>();
    for (const profile of ALL_COUNTRY_PROFILES) {
      if (profile.id && profile.id >= 11 && profile.id < 250) {
        validNationIds.add(profile.id);
      }
    }

    const totalPixels = width * height;
    const assignmentGrid = new Uint8Array(totalPixels);
    const distGrid = new Int32Array(totalPixels);
    distGrid.fill(2000000000);

    const maxQueueSize = totalPixels * 2;
    const queueX = new Int32Array(maxQueueSize);
    const queueY = new Int32Array(maxQueueSize);
    let head = 0;
    let tail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const rawId = rawNationGrid[idx]!;

        if (validNationIds.has(rawId)) {
          assignmentGrid[idx] = rawId;
          distGrid[idx] = 0;

          queueX[tail] = x;
          queueY[tail] = y;
          tail++;
        } else if (rawId >= 11 && rawId < 250) {
          assignmentGrid[idx] = 255;
        } else {
          assignmentGrid[idx] = 0;
        }
      }
    }

    const neighbors8 = [
      { dx: 1, dy: 0, cost: 10 },
      { dx: -1, dy: 0, cost: 10 },
      { dx: 0, dy: 1, cost: 10 },
      { dx: 0, dy: -1, cost: 10 },
      { dx: 1, dy: 1, cost: 14 },
      { dx: -1, dy: -1, cost: 14 },
      { dx: 1, dy: -1, cost: 14 },
      { dx: -1, dy: 1, cost: 14 },
    ];

    while (head < tail) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      head++;

      const cIdx = cy * width + cx;
      const currentDist = distGrid[cIdx]!;
      const currentNation = assignmentGrid[cIdx]!;

      for (let k = 0; k < 8; k++) {
        const n = neighbors8[k]!;
        const nx = cx + n.dx;
        const ny = cy + n.dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (assignmentGrid[nIdx] === 255) {
            const newDist = currentDist + n.cost;
            if (newDist < distGrid[nIdx]!) {
              distGrid[nIdx] = newDist;
              assignmentGrid[nIdx] = currentNation;

              if (tail < maxQueueSize) {
                queueX[tail] = nx;
                queueY[tail] = ny;
                tail++;
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      if (assignmentGrid[i] === 255) {
        assignmentGrid[i] = 0;
      }
    }

    this.processIsolatedIslands(assignmentGrid, width, height, validNationIds);

    this.classifyOceanAndLakes(assignmentGrid, width, height, bitBuffer);

    const activeCountryIds = new Set<number>();
    const pixelAreaMap = new Map<number, number>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = assignmentGrid[y * width + x]!;
        if (nationId >= 11 && nationId < 250) {
          activeCountryIds.add(nationId);
          pixelAreaMap.set(nationId, (pixelAreaMap.get(nationId) || 0) + 1);
        }
      }
    }

    return {
      activeCountryIds,
      pixelAreaMap,
      consolidatedNationGrid: assignmentGrid,
    };
  }

  private static classifyOceanAndLakes(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
  ): void {
    const totalPixels = width * height;
    const isOcean = new Uint8Array(totalPixels);
    const oceanQueue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    for (let x = 0; x < width; x++) {
      const topIdx = x;
      if (assignmentGrid[topIdx] === 0 && isOcean[topIdx] === 0) {
        isOcean[topIdx] = 1;
        oceanQueue[qTail++] = topIdx;
      }
      const btmIdx = (height - 1) * width + x;
      if (assignmentGrid[btmIdx] === 0 && isOcean[btmIdx] === 0) {
        isOcean[btmIdx] = 1;
        oceanQueue[qTail++] = btmIdx;
      }
    }

    for (let y = 0; y < height; y++) {
      const lIdx = y * width;
      if (assignmentGrid[lIdx] === 0 && isOcean[lIdx] === 0) {
        isOcean[lIdx] = 1;
        oceanQueue[qTail++] = lIdx;
      }
      const rIdx = y * width + (width - 1);
      if (assignmentGrid[rIdx] === 0 && isOcean[rIdx] === 0) {
        isOcean[rIdx] = 1;
        oceanQueue[qTail++] = rIdx;
      }
    }

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    while (qHead < qTail) {
      const currIdx = oceanQueue[qHead++]!;
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);

      for (let d = 0; d < 4; d++) {
        const dir = dirs[d]!;
        const nx = (cx + dir.dx + width) % width;
        const ny = cy + dir.dy;

        if (ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (assignmentGrid[nIdx] === 0 && isOcean[nIdx] === 0) {
            isOcean[nIdx] = 1;
            oceanQueue[qTail++] = nIdx;
          }
        }
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      if (assignmentGrid[i] === 0) {
        const x = i % width;
        const y = Math.floor(i / width);
        if (isOcean[i] === 1) {
          bitBuffer.setPixel(x, y, BitPackedCellUtility.WATER_OCEAN_ID);
        } else {
          assignmentGrid[i] = BitPackedCellUtility.WATER_LAKE_ID;
          bitBuffer.setPixel(x, y, BitPackedCellUtility.WATER_LAKE_ID);
        }
      }
    }
  }

  private static processIsolatedIslands(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    validNationIds: Set<number>,
  ): void {
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);

    const neighbors8 = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];

    for (let i = 0; i < totalPixels; i++) {
      if (assignmentGrid[i] !== 255 || visited[i] === 1) continue;

      const islandIndices: number[] = [];
      const queue: number[] = [i];
      visited[i] = 1;

      let head = 0;
      while (head < queue.length) {
        const currIdx = queue[head++]!;
        islandIndices.push(currIdx);

        const cx = currIdx % width;
        const cy = Math.floor(currIdx / width);

        for (let k = 0; k < 8; k++) {
          const nx = cx + neighbors8[k]!.dx;
          const ny = cy + neighbors8[k]!.dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (assignmentGrid[nIdx] === 255 && visited[nIdx] === 0) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }

      if (islandIndices.length === 0) continue;

      let nearestNation = 0;
      let minDistanceSq = Infinity;

      const sampleStep = Math.max(1, Math.floor(islandIndices.length / 40));
      for (let s = 0; s < islandIndices.length; s += sampleStep) {
        const pIdx = islandIndices[s]!;
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);

        const searchRadius = 60;
        for (let dy = -searchRadius; dy <= searchRadius; dy += 4) {
          const ny = py + dy;
          if (ny < 0 || ny >= height) continue;

          for (let dx = -searchRadius; dx <= searchRadius; dx += 4) {
            const nx = px + dx;
            if (nx < 0 || nx >= width) continue;

            const nIdx = ny * width + nx;
            const nNation = assignmentGrid[nIdx]!;

            if (validNationIds.has(nNation)) {
              const distSq = dx * dx + dy * dy;
              if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                nearestNation = nNation;
              }
            }
          }
        }
      }

      const maxAllowedDistSq =
        this.MAX_ISLAND_DISTANCE * this.MAX_ISLAND_DISTANCE;

      if (nearestNation > 0 && minDistanceSq <= maxAllowedDistSq) {
        for (let k = 0; k < islandIndices.length; k++) {
          const idx = islandIndices[k]!;
          assignmentGrid[idx] = nearestNation;
        }
      } else {
        for (let k = 0; k < islandIndices.length; k++) {
          const idx = islandIndices[k]!;
          assignmentGrid[idx] = 0;
        }
      }
    }
  }
}
