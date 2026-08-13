import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-cluster-types";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

interface ProvinceBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class SliverProvinceAbsorber {
  public static readonly MIN_PROVINCE_PIXEL_THRESHOLD = 700;

  public static absorbSliverProvinces(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const boundsMap = new Map<number, ProvinceBounds>();
    const raw = bitBuffer.getRawBuffer();
    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      const pid = raw[i]! & 0x0fff;
      if (pid < BitPackedCellUtility.FIRST_PROVINCE_ID) continue;

      const x = i % width;
      const y = Math.floor(i / width);
      const b = boundsMap.get(pid);

      if (!b) {
        boundsMap.set(pid, { minX: x, maxX: x, minY: y, maxY: y });
      } else {
        if (x < b.minX) b.minX = x;
        if (x > b.maxX) b.maxX = x;
        if (y < b.minY) b.minY = y;
        if (y > b.maxY) b.maxY = y;
      }
    }

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
      return;
    }

    sliverPids.sort((a, b) => {
      const infoA = provinceMap.get(a);
      const infoB = provinceMap.get(b);
      return (infoA?.pixelCount || 0) - (infoB?.pixelCount || 0);
    });

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

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

        const boundsA = boundsMap.get(sliverPid);
        for (let t = 0; t < sameNationNeighbors.length; t++) {
          const targetPid = sameNationNeighbors[t]!;
          const sharedBorder = boundsA
            ? this.calculateSharedBorderLength(
                bitBuffer,
                width,
                height,
                sliverPid,
                targetPid,
                boundsA,
              )
            : 0;
          if (sharedBorder > maxSharedBorder) {
            maxSharedBorder = sharedBorder;
            bestTargetPid = targetPid;
          }
        }
      } else {
        const boundsA = boundsMap.get(sliverPid);
        const queue: number[] = [];
        const visited = new Uint8Array(totalPixels);

        if (boundsA) {
          for (let y = boundsA.minY; y <= boundsA.maxY; y++) {
            const rowOffset = y * width;
            for (let x = boundsA.minX; x <= boundsA.maxX; x++) {
              const idx = rowOffset + x;
              if ((raw[idx]! & 0x0fff) === sliverPid) {
                queue.push(idx);
                visited[idx] = 1;
              }
            }
          }
        }

        let head = 0;
        let found = false;

        while (head < queue.length && !found) {
          const curr = queue[head++]!;
          const cx = curr % width;
          const cy = Math.floor(curr / width);

          for (let d = 0; d < 4; d++) {
            const dir = dirs[d]!;
            const nx = (cx + dir.dx + width) % width;
            const ny = cy + dir.dy;

            if (ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (visited[nIdx] === 0) {
                visited[nIdx] = 1;
                const nPid = raw[nIdx]! & 0x0fff;
                const nInfo = provinceMap.get(nPid);

                if (
                  nPid >= BitPackedCellUtility.FIRST_PROVINCE_ID &&
                  nPid !== sliverPid &&
                  nInfo &&
                  nInfo.countryNumericId === sliverInfo.countryNumericId
                ) {
                  bestTargetPid = nPid;
                  found = true;
                  break;
                }

                queue.push(nIdx);
              }
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
          boundsMap,
        );
        countryProvinceCounts.set(
          sliverInfo.countryNumericId,
          (countryProvinceCounts.get(sliverInfo.countryNumericId) || 1) - 1,
        );
      }
    }
  }

  private static calculateSharedBorderLength(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    pidA: number,
    pidB: number,
    boundsA: ProvinceBounds,
  ): number {
    const raw = bitBuffer.getRawBuffer();
    let sharedCount = 0;

    const startY = Math.max(0, boundsA.minY - 1);
    const endY = Math.min(height - 1, boundsA.maxY + 1);
    const startX = Math.max(0, boundsA.minX - 1);
    const endX = Math.min(width - 1, boundsA.maxX + 1);

    for (let y = startY; y <= endY; y++) {
      const rowOffset = y * width;
      for (let x = startX; x <= endX; x++) {
        const idx = rowOffset + x;
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
    boundsMap: Map<number, ProvinceBounds>,
  ): void {
    const sliverInfo = provinceMap.get(sliverPid);
    const targetInfo = provinceMap.get(targetPid);
    if (!sliverInfo || !targetInfo) return;

    const raw = bitBuffer.getRawBuffer();
    const boundsA = boundsMap.get(sliverPid);
    const boundsB = boundsMap.get(targetPid);

    if (boundsA) {
      for (let y = boundsA.minY; y <= boundsA.maxY; y++) {
        const rowOffset = y * width;
        for (let x = boundsA.minX; x <= boundsA.maxX; x++) {
          const idx = rowOffset + x;
          if ((raw[idx]! & 0x0fff) === sliverPid) {
            bitBuffer.setPixel(x, y, targetPid);
          }
        }
      }

      if (boundsB) {
        boundsB.minX = Math.min(boundsB.minX, boundsA.minX);
        boundsB.maxX = Math.max(boundsB.maxX, boundsA.maxX);
        boundsB.minY = Math.min(boundsB.minY, boundsA.minY);
        boundsB.maxY = Math.max(boundsB.maxY, boundsA.maxY);
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
