import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";

export interface LandPartitionResult {
  activeCountryIds: Set<number>;
  pixelAreaMap: Map<number, number>;
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
          bitBuffer.setNationId(x, y, rawId);

          queueX[tail] = x;
          queueY[tail] = y;
          tail++;
        } else if (rawId >= 11 && rawId < 250) {
          assignmentGrid[idx] = 255;
          bitBuffer.setNationId(x, y, 0);
        } else {
          assignmentGrid[idx] = 0;
          bitBuffer.setNationId(x, y, 0);
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
        let nx = cx + n.dx;
        if (nx < 0) nx = width - 1;
        else if (nx >= width) nx = 0;

        const ny = cy + n.dy;
        if (ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (assignmentGrid[nIdx] === 255) {
            const newDist = currentDist + n.cost;
            if (newDist < distGrid[nIdx]!) {
              distGrid[nIdx] = newDist;
              assignmentGrid[nIdx] = currentNation;
              bitBuffer.setNationId(nx, ny, currentNation);

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
        const x = i % width;
        const y = Math.floor(i / width);
        bitBuffer.setNationId(x, y, 0);
      }
    }

    this.processIsolatedIslands(
      assignmentGrid,
      width,
      height,
      bitBuffer,
      validNationIds,
    );

    const activeCountryIds = new Set<number>();
    const pixelAreaMap = new Map<number, number>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = bitBuffer.getNationId(x, y);
        if (nationId >= 11 && nationId < 250) {
          activeCountryIds.add(nationId);
          pixelAreaMap.set(nationId, (pixelAreaMap.get(nationId) || 0) + 1);
        }
      }
    }

    return { activeCountryIds, pixelAreaMap };
  }

  private static processIsolatedIslands(
    assignmentGrid: Uint8Array,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
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
          let nx = cx + neighbors8[k]!.dx;
          if (nx < 0) nx = width - 1;
          else if (nx >= width) nx = 0;

          const ny = cy + neighbors8[k]!.dy;
          if (ny >= 0 && ny < height) {
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
            let nx = px + dx;
            if (nx < 0) nx = width - 1;
            else if (nx >= width) nx = 0;

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
          const x = idx % width;
          const y = Math.floor(idx / width);
          assignmentGrid[idx] = nearestNation;
          bitBuffer.setNationId(x, y, nearestNation);
        }
      } else {
        for (let k = 0; k < islandIndices.length; k++) {
          const idx = islandIndices[k]!;
          const x = idx % width;
          const y = Math.floor(idx / width);
          assignmentGrid[idx] = 0;
          bitBuffer.setNationId(x, y, 0);
        }
      }
    }
  }
}
