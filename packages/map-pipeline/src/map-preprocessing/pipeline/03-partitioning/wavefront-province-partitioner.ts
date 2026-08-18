import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/core/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";
import { GeodesicSeedPicker } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/geodesic-seed-picker";
import { LloydRelaxationEngine } from "@/infrastructure/map-preprocessing/pipeline/03-partitioning/lloyd-relaxation-engine";

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

    const initialSeeds = GeodesicSeedPicker.pickSeeds(
      allPixelIndices,
      assignedProvinceIds.length,
      width,
    );

    LloydRelaxationEngine.partitionAndRelax(
      allPixelIndices,
      initialSeeds,
      assignedProvinceIds,
      group,
      width,
      height,
      bitBuffer,
      provinceMap,
    );

    return assignedProvinceIds;
  }
}
