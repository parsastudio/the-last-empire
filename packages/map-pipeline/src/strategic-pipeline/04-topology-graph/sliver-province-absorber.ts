import { BitPackedBuffer, BitPackedCellUtility } from "@geopolitics/domain";
import {
  ProvinceClusterInfo,
  ProvinceBounds,
} from "@/infrastructure/core/types/map-pipeline.types";
import { ProvinceBorderAnalyzer } from "@/infrastructure/strategic-pipeline/04-topology-graph/province-border-analyzer";

export class SliverProvinceAbsorber {
  public static absorbSliverProvinces(
    bitBuffer: BitPackedBuffer,
    width: number,
    height: number,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    const boundsMap = ProvinceBorderAnalyzer.calculateAllBounds(
      bitBuffer,
      width,
      height,
    );
    const raw = bitBuffer.getRawBuffer();
    const totalPixels = width * height;

    const countryProvinceCounts = new Map<number, number>();
    const countryTotalPixels = new Map<number, number>();

    for (const info of provinceMap.values()) {
      const cId = info.countryNumericId;
      countryProvinceCounts.set(cId, (countryProvinceCounts.get(cId) || 0) + 1);
      countryTotalPixels.set(
        cId,
        (countryTotalPixels.get(cId) || 0) + info.pixelCount,
      );
    }

    const sliverPids: number[] = [];
    for (const [pid, info] of provinceMap.entries()) {
      const nationTotalProvinces =
        countryProvinceCounts.get(info.countryNumericId) || 1;
      const totalCountryArea =
        countryTotalPixels.get(info.countryNumericId) || 1000;

      const dynamicSliverThreshold = Math.max(
        20,
        Math.min(
          200,
          Math.floor(totalCountryArea / (nationTotalProvinces * 5)),
        ),
      );

      if (
        nationTotalProvinces > 1 &&
        info.pixelCount < dynamicSliverThreshold
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
            ? ProvinceBorderAnalyzer.calculateSharedBorderLength(
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

    const combinedPopulation =
      (targetInfo.population || 0) + (sliverInfo.population || 0);
    const combinedCapacity =
      (targetInfo.maxPopulationCapacity || 0) +
      (sliverInfo.maxPopulationCapacity || 0);

    const totalPop = Math.max(1, combinedPopulation);
    const targetProd = targetInfo.perCapitaProductivity || 5000;
    const sliverProd = sliverInfo.perCapitaProductivity || 5000;
    const weightedProductivity = Math.round(
      ((targetInfo.population || 0) * targetProd +
        (sliverInfo.population || 0) * sliverProd) /
        totalPop,
    );

    targetInfo.pixelCount += sliverInfo.pixelCount;
    targetInfo.population = combinedPopulation;
    targetInfo.maxPopulationCapacity = combinedCapacity;
    targetInfo.perCapitaProductivity = weightedProductivity;

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
