import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class SliverProvinceAbsorber {
  public static readonly MIN_PROVINCE_PIXEL_THRESHOLD = 500;

  public static absorbSliverProvinces(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const sliverPids: number[] = [];
    for (const [pid, info] of provinceMap.entries()) {
      if (info.pixelCount < this.MIN_PROVINCE_PIXEL_THRESHOLD) {
        sliverPids.push(pid);
      }
    }

    if (sliverPids.length === 0) return;

    for (let s = 0; s < sliverPids.length; s++) {
      const sliverPid = sliverPids[s]!;
      const sliverInfo = provinceMap.get(sliverPid);
      if (!sliverInfo) continue;

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

      if (sameNationNeighbors.length === 0) continue;

      let bestTargetPid = sameNationNeighbors[0]!;
      let maxSharedBorder = -1;

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

      this.mergeProvinceIntoTarget(
        bitBuffer,
        width,
        height,
        sliverPid,
        bestTargetPid,
        provinceMap,
      );
    }
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
