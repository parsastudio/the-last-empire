import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class SliverProvinceAbsorber {
  public static readonly MIN_PROVINCE_PIXEL_THRESHOLD = 700;
  public static readonly MAX_CLEANUP_DISTANCE_PX = 200;

  public static absorbSliverProvinces(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const countryProvinceCounts = new Map<number, number>();
    for (const info of provinceMap.values()) {
      const cId = info.countryNumericId;
      countryProvinceCounts.set(cId, (countryProvinceCounts.get(cId) || 0) + 1);
    }

    const sliverPids: number[] = [];
    for (const [pid, info] of provinceMap.entries()) {
      const nationTotalProvinces =
        countryProvinceCounts.get(info.countryNumericId) || 1;
      if (
        nationTotalProvinces > 1 &&
        info.pixelCount < this.MIN_PROVINCE_PIXEL_THRESHOLD
      ) {
        sliverPids.push(pid);
      }
    }

    if (sliverPids.length === 0) {
      console.log(
        `[DIAGNOSTIC-CLEANUP] No small provinces (< ${this.MIN_PROVINCE_PIXEL_THRESHOLD} px in multi-province nations) found.`,
      );
      return;
    }

    sliverPids.sort((a, b) => {
      const infoA = provinceMap.get(a);
      const infoB = provinceMap.get(b);
      return (infoA?.pixelCount || 0) - (infoB?.pixelCount || 0);
    });

    console.log(
      `[DIAGNOSTIC-CLEANUP] Starting cleanup pass for ${sliverPids.length} small provinces (< ${this.MIN_PROVINCE_PIXEL_THRESHOLD} px).`,
    );
    let absorbedCount = 0;

    for (let s = 0; s < sliverPids.length; s++) {
      const sliverPid = sliverPids[s]!;
      const sliverInfo = provinceMap.get(sliverPid);
      if (!sliverInfo) continue;

      const nationTotalProvinces =
        countryProvinceCounts.get(sliverInfo.countryNumericId) || 1;
      if (nationTotalProvinces <= 1) continue;

      const sameNationNeighbors: number[] = [];
      for (const nPid of sliverInfo.landNeighbors) {
        const nInfo = provinceMap.get(nPid);
        if (
          nInfo &&
          nInfo.countryNumericId === sliverInfo.countryNumericId &&
          nPid !== sliverPid
        ) {
          sameNationNeighbors.push(nPid);
        }
      }

      let bestTargetPid: number | null = null;

      if (sameNationNeighbors.length > 0) {
        let maxSharedBorder = -1;
        bestTargetPid = sameNationNeighbors[0]!;

        for (let t = 0; t < sameNationNeighbors.length; t++) {
          const targetPid = sameNationNeighbors[t]!;
          const sharedBorder = this.calculateSharedBorderLength(
            bitBuffer,
            width,
            height,
            sliverPid,
            targetPid,
          );
          if (sharedBorder > maxSharedBorder) {
            maxSharedBorder = sharedBorder;
            bestTargetPid = targetPid;
          }
        }
      } else {
        let minDistSq = Infinity;
        const maxDistSq =
          this.MAX_CLEANUP_DISTANCE_PX * this.MAX_CLEANUP_DISTANCE_PX;

        for (const [otherPid, otherInfo] of provinceMap.entries()) {
          if (
            otherPid !== sliverPid &&
            otherInfo.countryNumericId === sliverInfo.countryNumericId
          ) {
            const directDx = Math.abs(
              sliverInfo.centerCoordinates.x - otherInfo.centerCoordinates.x,
            );
            const wrapDx = width - directDx;
            const dx = Math.min(directDx, wrapDx);
            const dy =
              sliverInfo.centerCoordinates.y - otherInfo.centerCoordinates.y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= maxDistSq && distSq < minDistSq) {
              minDistSq = distSq;
              bestTargetPid = otherPid;
            }
          }
        }
      }

      if (bestTargetPid !== null) {
        this.mergeProvinceIntoTarget(
          bitBuffer,
          width,
          height,
          sliverPid,
          bestTargetPid,
          provinceMap,
        );
        countryProvinceCounts.set(
          sliverInfo.countryNumericId,
          (countryProvinceCounts.get(sliverInfo.countryNumericId) || 1) - 1,
        );
        absorbedCount++;
      }
    }

    console.log(
      `[DIAGNOSTIC-CLEANUP] Cleanup pass complete. Successfully absorbed ${absorbedCount} small provinces.`,
    );
  }

  private static calculateSharedBorderLength(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    pidA: number,
    pidB: number,
  ): number {
    const raw = bitBuffer.getRawBuffer();
    let sharedCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const currentPid = raw[idx]! & 0x0fff;

        if (currentPid === pidA) {
          if (x + 1 < width && (raw[idx + 1]! & 0x0fff) === pidB) sharedCount++;
          if (x - 1 >= 0 && (raw[idx - 1]! & 0x0fff) === pidB) sharedCount++;
          if (y + 1 < height && (raw[idx + width]! & 0x0fff) === pidB)
            sharedCount++;
          if (y - 1 >= 0 && (raw[idx - width]! & 0x0fff) === pidB)
            sharedCount++;
        }
      }
    }

    return sharedCount;
  }

  private static mergeProvinceIntoTarget(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    sliverPid: number,
    targetPid: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const sliverInfo = provinceMap.get(sliverPid);
    const targetInfo = provinceMap.get(targetPid);
    if (!sliverInfo || !targetInfo) return;

    const raw = bitBuffer.getRawBuffer();
    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      if ((raw[i]! & 0x0fff) === sliverPid) {
        const x = i % width;
        const y = Math.floor(i / width);
        bitBuffer.setPixel(x, y, targetPid);
      }
    }

    targetInfo.pixelCount += sliverInfo.pixelCount;
    for (const neighbor of sliverInfo.landNeighbors) {
      if (neighbor !== targetPid && neighbor !== sliverPid) {
        targetInfo.landNeighbors.add(neighbor);
        const neighborInfo = provinceMap.get(neighbor);
        if (neighborInfo) {
          neighborInfo.landNeighbors.delete(sliverPid);
          neighborInfo.landNeighbors.add(targetPid);
        }
      }
    }

    if (sliverInfo.hasSeaAccess) {
      targetInfo.hasSeaAccess = true;
    }

    provinceMap.delete(sliverPid);
  }
}
