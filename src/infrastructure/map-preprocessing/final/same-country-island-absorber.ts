import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class SameCountryIslandAbsorber {
  public static absorbMicroGroups(
    unassignedGroups: ArchipelagoGroup[],
    assignedProvinceIds: number[],
    width: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    if (unassignedGroups.length === 0 || assignedProvinceIds.length === 0) {
      return;
    }

    for (let g = 0; g < unassignedGroups.length; g++) {
      const group = unassignedGroups[g]!;
      let minDistSq = Infinity;
      let bestPid = assignedProvinceIds[0]!;

      for (let p = 0; p < assignedProvinceIds.length; p++) {
        const pid = assignedProvinceIds[p]!;
        const provInfo = provinceMap.get(pid);
        if (!provInfo) continue;

        const directX = Math.abs(group.centerX - provInfo.centerCoordinates.x);
        const wrapX = width - directX;
        const dx = Math.min(directX, wrapX);

        const dy = group.centerY - provInfo.centerCoordinates.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistSq) {
          minDistSq = distSq;
          bestPid = pid;
        }
      }

      for (let c = 0; c < group.components.length; c++) {
        const comp = group.components[c]!;
        for (let i = 0; i < comp.pixelIndices.length; i++) {
          const idx = comp.pixelIndices[i]!;
          const x = idx % width;
          const y = Math.floor(idx / width);
          bitBuffer.setPixel(x, y, bestPid);
        }
      }

      const parentInfo = provinceMap.get(bestPid);
      if (parentInfo) {
        parentInfo.pixelCount += group.totalPixels;
      }
    }
  }
}
