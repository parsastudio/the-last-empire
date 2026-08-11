import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ProvinceClusterInfo,
  LandComponent,
  ArchipelagoGroup,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";
import { TopologicalComponentAnalyzer } from "@/infrastructure/map-preprocessing/final/topological-component-analyzer";
import { ProvinceCountAllocator } from "@/infrastructure/map-preprocessing/final/province-count-allocator";
import { WavefrontProvincePartitioner } from "@/infrastructure/map-preprocessing/final/wavefront-province-partitioner";
import { AtomicIslandAssigner } from "@/infrastructure/map-preprocessing/final/atomic-island-assigner";
import { SliverProvinceAbsorber } from "@/infrastructure/map-preprocessing/final/sliver-province-absorber";

export type { ProvinceClusterInfo };

export class ProvincePartitionEngine {
  public static readonly MINOR_MASS_THRESHOLD = 3500;
  public static readonly ISOLATED_WATER_DISTANCE_THRESHOLD = 120;

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

    for (const [countryNumericId, pixelIndices] of countryPixelsMap.entries()) {
      const allComponents = TopologicalComponentAnalyzer.analyzeComponents(
        pixelIndices,
        width,
      );

      if (allComponents.length === 0) continue;

      const majorComponents: LandComponent[] = [];
      const minorComponents: LandComponent[] = [];

      for (let i = 0; i < allComponents.length; i++) {
        const comp = allComponents[i]!;
        if (comp.size >= this.MINOR_MASS_THRESHOLD) {
          majorComponents.push(comp);
        } else {
          let isIsolated = true;
          for (let j = 0; j < allComponents.length; j++) {
            if (i === j) continue;
            const other = allComponents[j]!;
            if (other.size >= comp.size) {
              const directDx = Math.abs(comp.centerX - other.centerX);
              const dx = Math.min(directDx, width - directDx);
              const dy = comp.centerY - other.centerY;
              const dist = Math.hypot(dx, dy);
              if (dist <= this.ISOLATED_WATER_DISTANCE_THRESHOLD) {
                isIsolated = false;
                break;
              }
            }
          }

          if (isIsolated) {
            majorComponents.push(comp);
          } else {
            minorComponents.push(comp);
          }
        }
      }

      if (majorComponents.length === 0) {
        allComponents.sort((a, b) => b.size - a.size);
        const largest = allComponents[0]!;
        majorComponents.push(largest);
        minorComponents.shift();
      }

      const totalCountryPixels = pixelIndices.length;

      const majorGroups: ArchipelagoGroup[] = majorComponents.map(
        (comp, idx) => ({
          id: idx + 1,
          countryNumericId,
          components: [comp],
          totalPixels: comp.size,
          centerX: comp.centerX,
          centerY: comp.centerY,
        }),
      );

      const majorMasses = majorGroups.map((g) => ({
        id: g.id,
        components: g.components,
        totalPixels: g.totalPixels,
        centerX: g.centerX,
        centerY: g.centerY,
      }));

      const allocations = ProvinceCountAllocator.allocateProvincesToMasses(
        majorMasses,
        totalCountryPixels,
      );

      const assignedProvincesForCountry: number[] = [];

      for (let i = 0; i < majorGroups.length; i++) {
        const group = majorGroups[i]!;
        const kCount = allocations.get(group.id) || 1;

        const assignedIds = WavefrontProvincePartitioner.partitionGroup(
          group,
          kCount,
          globalProvinceCounter,
          width,
          height,
          bitBuffer,
          provinceMap,
        );

        for (let j = 0; j < assignedIds.length; j++) {
          assignedProvincesForCountry.push(assignedIds[j]!);
        }
        globalProvinceCounter += assignedIds.length;
      }

      AtomicIslandAssigner.assignMinorComponentsAtomically(
        minorComponents,
        assignedProvincesForCountry,
        width,
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
