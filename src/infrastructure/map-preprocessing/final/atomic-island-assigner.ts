import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { LandComponent } from "@/infrastructure/map-preprocessing/final/topological-component-analyzer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class AtomicIslandAssigner {
  public static assignMicroIslandsAtomically(
    microIslands: LandComponent[],
    assignedProvinces: number[],
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    if (assignedProvinces.length === 0 || microIslands.length === 0) return;

    for (const island of microIslands) {
      let minDistanceSq = Infinity;
      let bestPid = assignedProvinces[0]!;

      for (const pid of assignedProvinces) {
        const targetProv = provinceMap.get(pid);
        if (!targetProv) continue;

        const dx = island.centerX - targetProv.centerCoordinates.x;
        const dy = island.centerY - targetProv.centerCoordinates.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          bestPid = pid;
        }
      }

      for (const idx of island.pixelIndices) {
        const x = idx % width;
        const y = Math.floor(idx / width);
        bitBuffer.setPixel(x, y, bestPid);
      }

      const targetInfo = provinceMap.get(bestPid);
      if (targetInfo) {
        targetInfo.pixelCount += island.size;
      }
    }
  }
}
