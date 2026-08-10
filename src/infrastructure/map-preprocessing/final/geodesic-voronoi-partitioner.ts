import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class GeodesicVoronoiPartitioner {
  private static calculateChaikinCurvature(
    px: number,
    py: number,
    seedX: number,
    seedY: number,
  ): number {
    const angle = Math.atan2(py - seedY, px - seedX);
    const harmonic1 = Math.sin(angle * 3.0) * 4.5;
    const harmonic2 = Math.cos(angle * 5.0) * 2.5;
    const harmonic3 = Math.sin(px * 0.02 + py * 0.02) * 3.0;
    return harmonic1 + harmonic2 + harmonic3;
  }

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
    void height;
    if (allPixelIndices.length === 0 || initialSeeds.length === 0) {
      return;
    }

    let currentSeeds = [...initialSeeds];
    const iterations = 5;
    let finalAssignmentMap = new Map<number, number>();

    for (let iter = 0; iter < iterations; iter++) {
      finalAssignmentMap = this.runHexagonalCentroidalVoronoi(
        allPixelIndices,
        currentSeeds,
        assignedProvinceIds,
        width,
      );

      if (iter < iterations - 1) {
        currentSeeds = this.calculateCentroidSeeds(
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

  private static runHexagonalCentroidalVoronoi(
    allPixelIndices: number[],
    seeds: number[],
    assignedProvinceIds: number[],
    width: number,
  ): Map<number, number> {
    const assignmentMap = new Map<number, number>();
    const seedXArr = new Float64Array(seeds.length);
    const seedYArr = new Float64Array(seeds.length);

    for (let i = 0; i < seeds.length; i++) {
      const seedIdx = seeds[i]!;
      seedXArr[i] = seedIdx % width;
      seedYArr[i] = Math.floor(seedIdx / width);
    }

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const px = idx % width;
      const py = Math.floor(idx / width);

      let minDistance = Infinity;
      let bestPid = assignedProvinceIds[0]!;

      for (let s = 0; s < seeds.length; s++) {
        const sx = seedXArr[s]!;
        const sy = seedYArr[s]!;
        const dx = px - sx;
        const dy = py - sy;
        const rawDist = Math.sqrt(dx * dx + dy * dy);

        const curveJitter = this.calculateChaikinCurvature(px, py, sx, sy);
        const effectiveDist = rawDist + curveJitter;

        if (effectiveDist < minDistance) {
          minDistance = effectiveDist;
          bestPid = assignedProvinceIds[s]!;
        }
      }

      assignmentMap.set(idx, bestPid);
    }

    return assignmentMap;
  }

  private static calculateCentroidSeeds(
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
