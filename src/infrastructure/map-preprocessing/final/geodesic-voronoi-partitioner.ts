import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class GeodesicVoronoiPartitioner {
  public static partitionAndRelax(
    allPixelIndices: number[],
    initialSeeds: number[],
    assignedProvinceIds: number[],
    group: ArchipelagoGroup,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    if (allPixelIndices.length === 0 || initialSeeds.length === 0) {
      return;
    }

    const landPixelSet = new Set<number>(allPixelIndices);
    const k = initialSeeds.length;
    let currentSeeds = [...initialSeeds];

    const iterations = 3;
    let finalAssignmentMap = new Map<number, number>();

    for (let iter = 0; iter < iterations; iter++) {
      finalAssignmentMap = this.runMultiSourceLandBfs(
        allPixelIndices,
        currentSeeds,
        assignedProvinceIds,
        landPixelSet,
        width,
      );

      if (iter < iterations - 1) {
        currentSeeds = this.calculateNewCentroidSeeds(
          allPixelIndices,
          finalAssignmentMap,
          assignedProvinceIds,
          width,
        );
      }
    }

    const counts = new Map<number, number>();
    const sumXMap = new Map<number, number>();
    const sumYMap = new Map<number, number>();

    for (let i = 0; i < assignedProvinceIds.length; i++) {
      const pid = assignedProvinceIds[i]!;
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

    for (let i = 0; i < assignedProvinceIds.length; i++) {
      const pid = assignedProvinceIds[i]!;
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
  }

  private static runMultiSourceLandBfs(
    allPixelIndices: number[],
    seeds: number[],
    assignedProvinceIds: number[],
    landPixelSet: Set<number>,
    width: number,
  ): Map<number, number> {
    const assignmentMap = new Map<number, number>();
    const queue: number[] = [];

    for (let i = 0; i < seeds.length; i++) {
      const seedIdx = seeds[i]!;
      const pid = assignedProvinceIds[i]!;
      assignmentMap.set(seedIdx, pid);
      queue.push(seedIdx);
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;
      const currPid = assignmentMap.get(curr)!;
      const cx = curr % width;

      const candidates: number[] = [];
      if (cx > 0) candidates.push(curr - 1);
      if (cx < width - 1) candidates.push(curr + 1);
      candidates.push(curr + width);
      candidates.push(curr - width);

      for (let i = 0; i < candidates.length; i++) {
        const next = candidates[i]!;
        if (landPixelSet.has(next) && !assignmentMap.has(next)) {
          assignmentMap.set(next, currPid);
          queue.push(next);
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

  private static calculateNewCentroidSeeds(
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
