import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";
import { ComponentAnalyzer } from "@/infrastructure/map-preprocessing/pipeline/02-topology/component-analyzer";
import { LandMassClassifier } from "@/infrastructure/map-preprocessing/pipeline/02-topology/land-mass-classifier";
import { ProvinceCountAllocator } from "@/infrastructure/map-preprocessing/pipeline/02-topology/province-count-allocator";
import { WavefrontProvincePartitioner } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/wavefront-province-partitioner";
import { AtomicIslandAssigner } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/atomic-island-assigner";
import { ProvinceNeighborDetector } from "@/infrastructure/map-preprocessing/pipeline/04-topology-graph/province-neighbor-detector";
import { SliverProvinceAbsorber } from "@/infrastructure/map-preprocessing/pipeline/04-topology-graph/sliver-province-absorber";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

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
    let globalProvinceCounter = BitPackedCellUtility.FIRST_PROVINCE_ID;

    for (const [countryNumericId, pixelIndices] of countryPixelsMap.entries()) {
      const allComponents = ComponentAnalyzer.analyzeComponents(
        pixelIndices,
        width,
      );

      if (allComponents.length === 0) continue;

      const { majorGroups, minorComponents } = LandMassClassifier.classify(
        allComponents,
        countryNumericId,
        width,
      );

      const totalCountryPixels = pixelIndices.length;

      const majorMasses = majorGroups.map((g) => ({
        id: g.id,
        components: g.components,
        totalPixels: g.totalPixels,
      }));

      const allocations = ProvinceCountAllocator.allocateProvincesToMasses(
        majorMasses,
        totalCountryPixels,
        countryNumericId,
        width,
      );

      const assignedProvincesForCountry: number[] = [];
      const leftoverMinorComponents = [...minorComponents];

      for (let i = 0; i < majorGroups.length; i++) {
        const group = majorGroups[i]!;
        const kCount = allocations.get(group.id) ?? 0;

        if (kCount <= 0) {
          for (let c = 0; c < group.components.length; c++) {
            leftoverMinorComponents.push(group.components[c]!);
          }
          continue;
        }

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

      if (assignedProvincesForCountry.length === 0 && majorGroups.length > 0) {
        const fallbackGroup = majorGroups[0]!;
        const assignedIds = WavefrontProvincePartitioner.partitionGroup(
          fallbackGroup,
          1,
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
        leftoverMinorComponents,
        assignedProvincesForCountry,
        width,
        bitBuffer,
        provinceMap,
      );
    }

    ProvinceNeighborDetector.detect(bitBuffer, width, height, provinceMap);

    SliverProvinceAbsorber.absorbSliverProvinces(
      bitBuffer,
      width,
      height,
      provinceMap,
    );

    return provinceMap;
  }
}
