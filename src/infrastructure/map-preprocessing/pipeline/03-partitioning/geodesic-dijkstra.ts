import { LandMinHeap } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/utils/land-min-heap";

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

    for (let y = startY; y <= endY; y++) {
      const rowOffset = y * width;
      for (let x = startX; x <= endX; x++) {
        distMap[rowOffset + x] = 1e9;
      }
    }

    const heap = new LandMinHeap();

    for (let s = 0; s < seeds.length; s++) {
      const seedIdx = seeds[s]!;
      const pid = assignedProvinceIds[s]!;
      distMap[seedIdx] = 0;
      assignmentMap.set(seedIdx, pid);
      heap.push(seedIdx, 0);
    }

    const neighborOffsets = [
      { dx: 1, dy: 0, cost: 1000 },
      { dx: -1, dy: 0, cost: 1000 },
      { dx: 0, dy: 1, cost: 1000 },
      { dx: 0, dy: -1, cost: 1000 },
      { dx: 1, dy: 1, cost: 1414 },
      { dx: -1, dy: -1, cost: 1414 },
      { dx: 1, dy: -1, cost: 1414 },
      { dx: -1, dy: 1, cost: 1414 },
    ];

    while (heap.size() > 0) {
      const item = heap.pop()!;
      const currIdx = item.idx;
      const currDist = item.dist;

      if (currDist > distMap[currIdx]!) continue;

      const currPid = assignmentMap.get(currIdx)!;
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);

      for (let k = 0; k < 8; k++) {
        const off = neighborOffsets[k]!;
        const nx = cx + off.dx;
        const ny = cy + off.dy;

        if (nx >= startX && nx <= endX && ny >= startY && ny <= endY) {
          const nIdx = ny * width + nx;
          if (nIdx < totalMapPixels && landMask[nIdx] === 1) {
            const nextDist = currDist + off.cost;

            if (nextDist < distMap[nIdx]!) {
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
        newSeeds.push(allPixelIndices[0]!;
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
        const distSq = (px - avgX) * (px - avgX) + (py - avgY) * (py - avgY);
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