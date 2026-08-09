import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-cluster-types";
import {
  TopologicalComponentAnalyzer,
  LandComponent,
} from "@/infrastructure/map-preprocessing/final/topological-component-analyzer";
import { AtomicIslandAssigner } from "@/infrastructure/map-preprocessing/final/atomic-island-assigner";
import { SliverProvinceAbsorber } from "@/infrastructure/map-preprocessing/final/sliver-province-absorber";

export type { ProvinceClusterInfo };

export class ProvincePartitionEngine {
  public static partitionProvinces(
    rawNationGrid: Uint8Array,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
  ): Map<number, ProvinceClusterInfo> {
    const totalPixels = width * height;
    const countryPixelsMap = new Map<number, number[]>();

    for (let i = 0; i < totalPixels; i++) {
      const countryId = rawNationGrid[i]!;
      if (countryId >= 11 && countryId < 250) {
        let list = countryPixelsMap.get(countryId);
        if (!list) {
          list = [];
          countryPixelsMap.set(countryId, list);
        }
        list.push(i);
      }
    }

    const provinceMap = new Map<number, ProvinceClusterInfo>();
    let globalProvinceCounter = 1;

    for (const [countryId, pixelIndices] of countryPixelsMap.entries()) {
      const k = this.calculateProvinceCount(pixelIndices.length);
      const components = TopologicalComponentAnalyzer.analyzeComponents(
        pixelIndices,
        width,
        height,
      );

      const mainComponents: LandComponent[] = [];
      const microIslands: LandComponent[] = [];

      for (const comp of components) {
        if (!comp.isMicroIsland) {
          mainComponents.push(comp);
        } else {
          microIslands.push(comp);
        }
      }

      if (mainComponents.length === 0 && microIslands.length > 0) {
        mainComponents.push(microIslands.shift()!);
      }

      const assignedProvinces = this.clusterMainlandProvinces(
        mainComponents,
        k,
        countryId,
        globalProvinceCounter,
        width,
        height,
        bitBuffer,
        provinceMap,
      );

      globalProvinceCounter += assignedProvinces.length;

      AtomicIslandAssigner.assignMicroIslandsAtomically(
        microIslands,
        assignedProvinces,
        width,
        height,
        bitBuffer,
        provinceMap,
      );
    }

    this.detectProvinceNeighbors(bitBuffer, width, height, provinceMap);

    SliverProvinceAbsorber.absorbSliverProvinces(
      bitBuffer,
      width,
      height,
      provinceMap,
    );

    return provinceMap;
  }

  private static calculateProvinceCount(totalPixels: number): number {
    if (totalPixels < 500) return 1;
    const val = Math.floor(1 + 3.5 * Math.log10(totalPixels / 500));
    return Math.max(1, Math.min(32, val));
  }

  private static clusterMainlandProvinces(
    components: LandComponent[],
    totalK: number,
    countryNumericId: number,
    startProvinceId: number,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): number[] {
    void height;
    const allMainPixels = components.flatMap((c) => c.pixelIndices);
    const assignedIds: number[] = [];

    if (totalK <= 1 || allMainPixels.length === 0) {
      const pid = startProvinceId;
      assignedIds.push(pid);

      let sumX = 0;
      let sumY = 0;
      for (const idx of allMainPixels) {
        const x = idx % width;
        const y = Math.floor(idx / width);
        bitBuffer.setPixel(x, y, pid);
        sumX += x;
        sumY += y;
      }

      provinceMap.set(pid, {
        provinceId: pid,
        countryNumericId,
        pixelCount: allMainPixels.length,
        hasSeaAccess: false,
        centerCoordinates: {
          x: Math.floor(sumX / (allMainPixels.length || 1)),
          y: Math.floor(sumY / (allMainPixels.length || 1)),
        },
        landNeighbors: new Set<number>(),
      });

      return assignedIds;
    }

    const seedsX: number[] = [];
    const seedsY: number[] = [];

    const firstIdx = allMainPixels[Math.floor(allMainPixels.length / 2)]!;
    seedsX.push(firstIdx % width);
    seedsY.push(Math.floor(firstIdx / width));
    assignedIds.push(startProvinceId);

    while (seedsX.length < totalK) {
      let maxDistSq = -1;
      let bestPixelIdx = allMainPixels[0]!;

      const sampleStep = Math.max(1, Math.floor(allMainPixels.length / 500));
      for (let i = 0; i < allMainPixels.length; i += sampleStep) {
        const pIdx = allMainPixels[i]!;
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);

        let minDistToSeedsSq = Infinity;
        for (let s = 0; s < seedsX.length; s++) {
          const dx = px - seedsX[s]!;
          const dy = py - seedsY[s]!;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistToSeedsSq) {
            minDistToSeedsSq = dSq;
          }
        }

        if (minDistToSeedsSq > maxDistSq) {
          maxDistSq = minDistToSeedsSq;
          bestPixelIdx = pIdx;
        }
      }

      seedsX.push(bestPixelIdx % width);
      seedsY.push(Math.floor(bestPixelIdx / width));
      assignedIds.push(startProvinceId + seedsX.length - 1);
    }

    const pixelToProvince = new Map<number, number>();

    for (let iter = 0; iter < 3; iter++) {
      pixelToProvince.clear();

      for (const pIdx of allMainPixels) {
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);

        let minDistSq = Infinity;
        let bestPid = assignedIds[0]!;

        for (let s = 0; s < seedsX.length; s++) {
          const dx = px - seedsX[s]!;
          const dy = py - seedsY[s]!;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            bestPid = assignedIds[s]!;
          }
        }

        pixelToProvince.set(pIdx, bestPid);
      }

      if (iter < 2) {
        const sumX = new Map<number, number>();
        const sumY = new Map<number, number>();
        const countMap = new Map<number, number>();

        for (const pIdx of allMainPixels) {
          const pid = pixelToProvince.get(pIdx)!;
          const px = pIdx % width;
          const py = Math.floor(pIdx / width);

          sumX.set(pid, (sumX.get(pid) || 0) + px);
          sumY.set(pid, (sumY.get(pid) || 0) + py);
          countMap.set(pid, (countMap.get(pid) || 0) + 1);
        }

        for (let s = 0; s < assignedIds.length; s++) {
          const pid = assignedIds[s]!;
          const cnt = countMap.get(pid) || 1;
          seedsX[s] = Math.floor((sumX.get(pid) || 0) / cnt);
          seedsY[s] = Math.floor((sumY.get(pid) || 0) / cnt);
        }
      }
    }

    const provincePixelCounts = new Map<number, number>();
    const sumXMap = new Map<number, number>();
    const sumYMap = new Map<number, number>();

    for (const pid of assignedIds) {
      provincePixelCounts.set(pid, 0);
      sumXMap.set(pid, 0);
      sumYMap.set(pid, 0);
    }

    for (const idx of allMainPixels) {
      const pid = pixelToProvince.get(idx) || assignedIds[0]!;
      const x = idx % width;
      const y = Math.floor(idx / width);

      bitBuffer.setPixel(x, y, pid);

      provincePixelCounts.set(pid, (provincePixelCounts.get(pid) || 0) + 1);
      sumXMap.set(pid, (sumXMap.get(pid) || 0) + x);
      sumYMap.set(pid, (sumYMap.get(pid) || 0) + y);
    }

    for (const pid of assignedIds) {
      const count = provincePixelCounts.get(pid) || 1;
      provinceMap.set(pid, {
        provinceId: pid,
        countryNumericId,
        pixelCount: count,
        hasSeaAccess: false,
        centerCoordinates: {
          x: Math.floor((sumXMap.get(pid) || 0) / count),
          y: Math.floor((sumYMap.get(pid) || 0) / count),
        },
        landNeighbors: new Set<number>(),
      });
    }

    return assignedIds;
  }

  private static detectProvinceNeighbors(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const raw = bitBuffer.getRawBuffer();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const p1 = raw[idx]! & 0x0fff;

        if (p1 === 0) continue;

        const info1 = provinceMap.get(p1);

        if (x + 1 < width) {
          const p2 = raw[idx + 1]! & 0x0fff;
          if (p2 === 0 && info1) {
            info1.hasSeaAccess = true;
          } else if (p2 > 0 && p2 !== p1) {
            const info2 = provinceMap.get(p2);
            if (info1) info1.landNeighbors.add(p2);
            if (info2) info2.landNeighbors.add(p1);
          }
        }

        if (y + 1 < height) {
          const p3 = raw[idx + width]! & 0x0fff;
          if (p3 === 0 && info1) {
            info1.hasSeaAccess = true;
          } else if (p3 > 0 && p3 !== p1) {
            const info3 = provinceMap.get(p3);
            if (info1) info1.landNeighbors.add(p3);
            if (info3) info3.landNeighbors.add(p1);
          }
        }
      }
    }
  }
}
