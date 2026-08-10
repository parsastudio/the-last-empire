import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  LandComponent,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class AtomicIslandAssigner {
  public static assignMinorComponentsAtomically(
    minorComponents: LandComponent[],
    assignedProvinceIds: number[],
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    void height;
    if (assignedProvinceIds.length === 0 || minorComponents.length === 0) {
      return;
    }

    for (let c = 0; c < minorComponents.length; c++) {
      const island = minorComponents[c]!;
      let minDistanceSq = Infinity;
      let bestProvinceId = assignedProvinceIds[0]!;

      for (let p = 0; p < assignedProvinceIds.length; p++) {
        const pid = assignedProvinceIds[p]!;
        const targetProv = provinceMap.get(pid);
        if (!targetProv) continue;

        const directDx = Math.abs(
          island.centerX - targetProv.centerCoordinates.x,
        );
        const wrapDx = width - directDx;
        const dx = Math.min(directDx, wrapDx);

        const dy = island.centerY - targetProv.centerCoordinates.y;
        let distSq = dx * dx + dy * dy;

        if (targetProv.hasSeaAccess) {
          distSq *= 0.8;
        }

        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          bestProvinceId = pid;
        }
      }

      for (let i = 0; i < island.pixelIndices.length; i++) {
        const idx = island.pixelIndices[i]!;
        const x = idx % width;
        const y = Math.floor(idx / width);
        bitBuffer.setPixel(x, y, bestProvinceId);
      }

      const targetInfo = provinceMap.get(bestProvinceId);
      if (targetInfo) {
        targetInfo.pixelCount += island.size;
      }
    }
  }
}
