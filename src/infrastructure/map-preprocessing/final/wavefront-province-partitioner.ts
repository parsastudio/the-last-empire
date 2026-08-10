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
    for (let i = 0; i < group.components.length; i++) {
      const comp = group.components[i]!;
      for (let j = 0; j < comp.pixelIndices.length; j++) {
        allPixelIndices.push(comp.pixelIndices[j]!);
      }
    }

    const assignedProvinceIds: number[] = [];

    if (targetK <= 1 || allPixelIndices.length === 0) {
      const pid = startProvinceId;
      assignedProvinceIds.push(pid);

      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < allPixelIndices.length; i++) {
        const idx = allPixelIndices[i]!;
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

    const k = assignedProvinceIds.length;
    const seedsX = new Float64Array(k);
    const seedsY = new Float64Array(k);

    const firstIdx = allPixelIndices[Math.floor(allPixelIndices.length / 2)]!;
    seedsX[0] = firstIdx % width;
    seedsY[0] = Math.floor(firstIdx / width);

    for (let s = 1; s < k; s++) {
      let maxDistSq = -1;
      let bestIdx = allPixelIndices[0]!;

      const step = Math.max(1, Math.floor(allPixelIndices.length / 300));
      for (let i = 0; i < allPixelIndices.length; i += step) {
        const idx = allPixelIndices[i]!;
        const px = idx % width;
        const py = Math.floor(idx / width);

        let minDistSq = Infinity;
        for (let j = 0; j < s; j++) {
          const directDx = Math.abs(px - seedsX[j]!);
          const dx = Math.min(directDx, width - directDx);
          const dy = py - seedsY[j]!;
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

      seedsX[s] = bestIdx % width;
      seedsY[s] = Math.floor(bestIdx / width);
    }

    const assignments = new Int32Array(allPixelIndices.length);
    const numIterations = 6;

    for (let iter = 0; iter < numIterations; iter++) {
      for (let i = 0; i < allPixelIndices.length; i++) {
        const idx = allPixelIndices[i]!;
        const px = idx % width;
        const py = Math.floor(idx / width);

        let minDistSq = Infinity;
        let bestK = 0;

        for (let s = 0; s < k; s++) {
          const directDx = Math.abs(px - seedsX[s]!);
          const dx = Math.min(directDx, width - directDx);
          const dy = py - seedsY[s]!;
          const dSq = dx * dx + dy * dy;

          if (dSq < minDistSq) {
            minDistSq = dSq;
            bestK = s;
          }
        }

        assignments[i] = bestK;
      }

      if (iter < numIterations - 1) {
        const sumXArr = new Float64Array(k);
        const sumYArr = new Float64Array(k);
        const countArr = new Int32Array(k);

        for (let i = 0; i < allPixelIndices.length; i++) {
          const idx = allPixelIndices[i]!;
          const s = assignments[i]!;
          sumXArr[s] += idx % width;
          sumYArr[s] += Math.floor(idx / width);
          countArr[s] += 1;
        }

        for (let s = 0; s < k; s++) {
          const count = countArr[s]!;
          if (count > 0) {
            seedsX[s] = sumXArr[s]! / count;
            seedsY[s] = sumYArr[s]! / count;
          }
        }
      }
    }

    const pixelSet = new Set<number>(allPixelIndices);
    const finalAssignmentMap = new Map<number, number>();
    const queue: number[] = [];

    for (let s = 0; s < k; s++) {
      const pid = assignedProvinceIds[s]!;
      const sx = seedsX[s]!;
      const sy = seedsY[s]!;

      let closestPixelIdx = -1;
      let minDistSq = Infinity;

      for (let i = 0; i < allPixelIndices.length; i++) {
        if (assignments[i] === s) {
          const pIdx = allPixelIndices[i]!;
          const px = pIdx % width;
          const py = Math.floor(pIdx / width);
          const dSq = (px - sx) * (px - sx) + (py - sy) * (py - sy);
          if (dSq < minDistSq) {
            minDistSq = dSq;
            closestPixelIdx = pIdx;
          }
        }
      }

      if (closestPixelIdx !== -1 && !finalAssignmentMap.has(closestPixelIdx)) {
        finalAssignmentMap.set(closestPixelIdx, pid);
        queue.push(closestPixelIdx);
      }
    }

    if (queue.length === 0 && allPixelIndices.length > 0) {
      const pid = assignedProvinceIds[0]!;
      const pIdx = allPixelIndices[0]!;
      finalAssignmentMap.set(pIdx, pid);
      queue.push(pIdx);
    }

    let head = 0;
    const neighbors = [1, -1, width, -width];

    while (head < queue.length) {
      const curr = queue[head++]!;
      const pid = finalAssignmentMap.get(curr)!;

      for (let n = 0; n < 4; n++) {
        const nxt = curr + neighbors[n]!;
        if (pixelSet.has(nxt) && !finalAssignmentMap.has(nxt)) {
          finalAssignmentMap.set(nxt, pid);
          queue.push(nxt);
        }
      }
    }

    const counts = new Map<number, number>();
    const sumXMap = new Map<number, number>();
    const sumYMap = new Map<number, number>();

    for (let s = 0; s < assignedProvinceIds.length; s++) {
      const pid = assignedProvinceIds[s]!;
      counts.set(pid, 0);
      sumXMap.set(pid, 0);
      sumYMap.set(pid, 0);
    }

    const defaultPid = assignedProvinceIds[0]!;
    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const pid = finalAssignmentMap.get(idx) || defaultPid;
      const x = idx % width;
      const y = Math.floor(idx / width);

      bitBuffer.setPixel(x, y, pid);

      counts.set(pid, (counts.get(pid) || 0) + 1);
      sumXMap.set(pid, (sumXMap.get(pid) || 0) + x);
      sumYMap.set(pid, (sumYMap.get(pid) || 0) + y);
    }

    for (let s = 0; s < assignedProvinceIds.length; s++) {
      const pid = assignedProvinceIds[s]!;
      const count = counts.get(pid) || 1;
      provinceMap.set(pid, {
        provinceId: pid,
        countryNumericId: group.countryNumericId,
        pixelCount: count,
        hasSeaAccess: false,
        centerCoordinates: {
          x: Math.floor((sumXMap.get(pid) || 0) / count),
          y: Math.floor((sumYMap.get(pid) || 0) / count),
        },
        landNeighbors: new Set<number>(),
      });
    }

    return assignedProvinceIds;
  }
}
