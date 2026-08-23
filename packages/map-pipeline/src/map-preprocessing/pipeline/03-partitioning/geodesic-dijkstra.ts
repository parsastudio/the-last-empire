import { LandMinHeap } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/utils/land-min-heap";
import { OrganicCostNoise } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/utils/organic-cost-noise";

export class GeodesicDijkstra {
  public static runPureLandDijkstra(
    allPixelIndices: number[],
    seeds: number[],
    assignedProvinceIds: number[],
    landMask: Uint8Array,
    distMap: Float32Array,
    startX: number,
    endX: number,
    startY: number,
    endY: number,
    width: number,
    totalMapPixels: number,
  ): Map<number, number> {
    const assignmentMap = new Map<number, number>();
    const totalLandPixels = allPixelIndices.length;
    const kCount = assignedProvinceIds.length;
    const targetSizePerProvince = Math.max(
      1,
      Math.floor(totalLandPixels / kCount),
    );

    const provincePixelCounts = new Map<number, number>();
    for (let i = 0; i < kCount; i++) {
      provincePixelCounts.set(assignedProvinceIds[i]!, 0);
    }

    for (let i = 0; i < allPixelIndices.length; i++) {
      distMap[allPixelIndices[i]!] = 1e9;
    }

    const heap = new LandMinHeap();

    for (let s = 0; s < seeds.length; s++) {
      const seedIdx = seeds[s]!;
      const pid = assignedProvinceIds[s]!;
      distMap[seedIdx] = 0;
      assignmentMap.set(seedIdx, pid);
      provincePixelCounts.set(pid, 1);
      heap.push(seedIdx, 0);
    }

    const neighborOffsets = [
      { dx: 1, dy: 0, baseCost: 1000 },
      { dx: -1, dy: 0, baseCost: 1000 },
      { dx: 0, dy: 1, baseCost: 1000 },
      { dx: 0, dy: -1, baseCost: 1000 },
      { dx: 1, dy: 1, baseCost: 1414 },
      { dx: -1, dy: 1, baseCost: 1414 },
      { dx: 1, dy: -1, baseCost: 1414 },
      { dx: -1, dy: -1, baseCost: 1414 },
    ];

    while (heap.size() > 0) {
      const item = heap.pop()!;
      const currIdx = item.idx;
      const currDist = item.dist;

      if (currDist > distMap[currIdx]!) continue;

      const currPid = assignmentMap.get(currIdx)!;
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);

      const currentAssignedCount = provincePixelCounts.get(currPid) ?? 0;
      const capacityRatio = currentAssignedCount / targetSizePerProvince;
      const capacityDamping = Math.pow(Math.max(0.5, capacityRatio), 1.8);

      for (let k = 0; k < 8; k++) {
        const off = neighborOffsets[k]!;
        const nx = (cx + off.dx + width) % width;
        const ny = cy + off.dy;

        if (ny >= startY && ny <= endY) {
          const nIdx = ny * width + nx;
          if (nIdx < totalMapPixels && landMask[nIdx] === 1) {
            const rawNoiseCost = OrganicCostNoise.getTraverseCost(
              nx,
              ny,
              off.baseCost,
            );
            const stepCost = Math.round(rawNoiseCost * capacityDamping);
            const nextDist = currDist + stepCost;

            if (nextDist < distMap[nIdx]!) {
              const oldPid = assignmentMap.get(nIdx);
              if (oldPid !== undefined && oldPid !== currPid) {
                const oldCount = provincePixelCounts.get(oldPid) ?? 1;
                provincePixelCounts.set(oldPid, Math.max(0, oldCount - 1));
              }

              if (oldPid !== currPid) {
                provincePixelCounts.set(
                  currPid,
                  (provincePixelCounts.get(currPid) ?? 0) + 1,
                );
              }

              distMap[nIdx] = nextDist;
              assignmentMap.set(nIdx, currPid);
              heap.push(nIdx, nextDist);
            }
          }
        }
      }
    }

    const defaultPid = assignedProvinceIds[0]!;
    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      if (!assignmentMap.has(idx)) {
        assignmentMap.set(idx, defaultPid);
      }
    }

    return assignmentMap;
  }

  public static calculateCentroidSeeds(
    allPixelIndices: number[],
    assignmentMap: Map<number, number>,
    assignedProvinceIds: number[],
    width: number,
  ): number[] {
    const provincePixelsMap = new Map<number, number[]>();
    for (let i = 0; i < assignedProvinceIds.length; i++) {
      provincePixelsMap.set(assignedProvinceIds[i]!, []);
    }

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const pid = assignmentMap.get(idx);
      if (pid && provincePixelsMap.has(pid)) {
        provincePixelsMap.get(pid)!.push(idx);
      }
    }

    const newSeeds: number[] = [];

    for (let i = 0; i < assignedProvinceIds.length; i++) {
      const pid = assignedProvinceIds[i]!;
      const pixels = provincePixelsMap.get(pid) || [];

      if (pixels.length === 0) {
        newSeeds.push(allPixelIndices[0]!);
        continue;
      }

      let sumX = 0;
      let sumY = 0;
      for (let j = 0; j < pixels.length; j++) {
        const pIdx = pixels[j]!;
        sumX += pIdx % width;
        sumY += Math.floor(pIdx / width);
      }

      const avgX = Math.floor(sumX / pixels.length);
      const avgY = Math.floor(sumY / pixels.length);

      let bestSeed = pixels[0]!;
      let minDistSq = Infinity;

      for (let j = 0; j < pixels.length; j++) {
        const pIdx = pixels[j]!;
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);
        const directDx = Math.abs(px - avgX);
        const dx = Math.min(directDx, width - directDx);
        const dy = py - avgY;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistSq) {
          minDistSq = distSq;
          bestSeed = pIdx;
        }
      }

      newSeeds.push(bestSeed);
    }

    return newSeeds;
  }
}
