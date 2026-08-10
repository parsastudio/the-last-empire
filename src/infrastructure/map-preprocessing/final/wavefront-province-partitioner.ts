import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class WavefrontProvincePartitioner {
  public static partitionGroup(
    group: ArchipelagoGroup,
    targetK: number,
    startProvinceId: number,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): number[] {
    void height;
    const allPixelIndices: number[] = [];
    for (const comp of group.components) {
      allPixelIndices.push(...comp.pixelIndices);
    }

    const assignedProvinceIds: number[] = [];

    if (targetK <= 1 || allPixelIndices.length === 0) {
      const pid = startProvinceId;
      assignedProvinceIds.push(pid);

      let sumX = 0;
      let sumY = 0;
      for (const idx of allPixelIndices) {
        const x = idx % width;
        const y = Math.floor(idx / width);
        bitBuffer.setPixel(x, y, pid);
        sumX += x;
        sumY += y;
      }

      provinceMap.set(pid, {
        provinceId: pid,
        countryNumericId: group.countryNumericId,
        pixelCount: allPixelIndices.length,
        hasSeaAccess: false,
        centerCoordinates: {
          x: Math.floor(sumX / (allPixelIndices.length || 1)),
          y: Math.floor(sumY / (allPixelIndices.length || 1)),
        },
        landNeighbors: new Set<number>(),
      });

      return assignedProvinceIds;
    }

    for (let k = 0; k < targetK; k++) {
      assignedProvinceIds.push(startProvinceId + k);
    }

    const seedsX: number[] = [];
    const seedsY: number[] = [];

    const midIdx = allPixelIndices[Math.floor(allPixelIndices.length / 2)]!;
    seedsX.push(midIdx % width);
    seedsY.push(Math.floor(midIdx / width));

    while (seedsX.length < targetK) {
      let maxDistSq = -1;
      let bestIdx = allPixelIndices[0]!;

      const step = Math.max(1, Math.floor(allPixelIndices.length / 400));
      for (let i = 0; i < allPixelIndices.length; i += step) {
        const idx = allPixelIndices[i]!;
        const px = idx % width;
        const py = Math.floor(idx / width);

        let minDistSq = Infinity;
        for (let s = 0; s < seedsX.length; s++) {
          const dx = px - seedsX[s]!;
          const dy = py - seedsY[s]!;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistSq) {
            minDistSq = dSq;
          }
        }

        if (minDistSq > maxDistSq) {
          maxDistSq = minDistSq;
          bestIdx = idx;
        }
      }

      seedsX.push(bestIdx % width);
      seedsY.push(Math.floor(bestIdx / width));
    }

    const pixelSet = new Set<number>(allPixelIndices);
    const pixelToProvince = new Map<number, number>();

    const queue: number[] = [];
    const distMap = new Map<number, number>();

    for (let s = 0; s < targetK; s++) {
      const sx = seedsX[s]!;
      const sy = seedsY[s]!;
      let closestPixelIdx = allPixelIndices[0]!;
      let minDistSq = Infinity;

      for (const pIdx of allPixelIndices) {
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);
        const dSq = (px - sx) * (px - sx) + (py - sy) * (py - sy);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestPixelIdx = pIdx;
        }
      }

      const pid = assignedProvinceIds[s]!;
      pixelToProvince.set(closestPixelIdx, pid);
      distMap.set(closestPixelIdx, 0);
      queue.push(closestPixelIdx);
    }

    let head = 0;
    const neighbors = [1, -1, width, -width];

    while (head < queue.length) {
      const curr = queue[head++]!;
      const pid = pixelToProvince.get(curr)!;
      const currDist = distMap.get(curr)!;

      for (const nxtOffset of neighbors) {
        const nxt = curr + nxtOffset;
        if (pixelSet.has(nxt) && !pixelToProvince.has(nxt)) {
          pixelToProvince.set(nxt, pid);
          distMap.set(nxt, currDist + 1);
          queue.push(nxt);
        }
      }
    }

    const counts = new Map<number, number>();
    const sumX = new Map<number, number>();
    const sumY = new Map<number, number>();

    for (const pid of assignedProvinceIds) {
      counts.set(pid, 0);
      sumX.set(pid, 0);
      sumY.set(pid, 0);
    }

    for (const idx of allPixelIndices) {
      const pid = pixelToProvince.get(idx) || assignedProvinceIds[0]!;
      const x = idx % width;
      const y = Math.floor(idx / width);

      bitBuffer.setPixel(x, y, pid);

      counts.set(pid, (counts.get(pid) || 0) + 1);
      sumX.set(pid, (sumX.get(pid) || 0) + x);
      sumY.set(pid, (sumY.get(pid) || 0) + y);
    }

    for (const pid of assignedProvinceIds) {
      const count = counts.get(pid) || 1;
      provinceMap.set(pid, {
        provinceId: pid,
        countryNumericId: group.countryNumericId,
        pixelCount: count,
        hasSeaAccess: false,
        centerCoordinates: {
          x: Math.floor((sumX.get(pid) || 0) / count),
          y: Math.floor((sumY.get(pid) || 0) / count),
        },
        landNeighbors: new Set<number>(),
      });
    }

    return assignedProvinceIds;
  }
}
