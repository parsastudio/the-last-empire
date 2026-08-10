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

    for (const group of unassignedGroups) {
      let minDistSq = Infinity;
      let bestPid = assignedProvinceIds[0]!;

      for (const pid of assignedProvinceIds) {
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

      for (const comp of group.components) {
        for (const idx of comp.pixelIndices) {
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
