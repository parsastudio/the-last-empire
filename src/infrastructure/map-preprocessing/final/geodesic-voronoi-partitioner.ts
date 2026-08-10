import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

interface MicroCell {
  id: number;
  pixels: number[];
  centroidX: number;
  centroidY: number;
}

export class GeodesicVoronoiPartitioner {
  public static partitionAndRelax(
    allPixelIndices: number[],
    microSeeds: number[],
    assignedProvinceIds: number[],
    group: ArchipelagoGroup,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    void height;
    if (allPixelIndices.length === 0 || microSeeds.length === 0) {
      return;
    }

    const microCells = this.generateMicroSuperpixels(
      allPixelIndices,
      microSeeds,
      width,
    );

    const microToProvinceMap = this.clusterMicroCellsToProvinces(
      microCells,
      assignedProvinceIds,
    );

    const counts = new Map<number, number>();
    const sumXMap = new Map<number, number>();
    const sumYMap = new Map<number, number>();

    for (let i = 0; i < assignedProvinceIds.length; i++) {
      const pid = assignedProvinceIds[i]!;
      counts.set(pid, 0);
      sumXMap.set(pid, 0);
      sumYMap.set(pid, 0);
    }

    const defaultPid = assignedProvinceIds[0]!;

    for (let i = 0; i < microCells.length; i++) {
      const cell = microCells[i]!;
      const pid = microToProvinceMap.get(cell.id) || defaultPid;

      for (let j = 0; j < cell.pixels.length; j++) {
        const pIdx = cell.pixels[j]!;
        const x = pIdx % width;
        const y = Math.floor(pIdx / width);

        bitBuffer.setPixel(x, y, pid);

        counts.set(pid, (counts.get(pid) || 0) + 1);
        sumXMap.set(pid, (sumXMap.get(pid) || 0) + x);
        sumYMap.set(pid, (sumYMap.get(pid) || 0) + y);
      }
    }

    for (let i = 0; i < assignedProvinceIds.length; i++) {
      const pid = assignedProvinceIds[i]!;
      const count = counts.get(pid) || 1;
      provinceMap.set(pid, {
        provinceId: pid,
        countryNumericId: group.countryNumericId,
        pixelCount: count,
        hasSeaAccess: false,
        centerCoordinates: {
          x: Math.floor((sumXMap.get(pid) || 0) / count),
          y: Math.floor((sumYMap.get(pid) || 0) / count),
        },
        landNeighbors: new Set<number>(),
      });
    }
  }

  private static generateMicroSuperpixels(
    allPixelIndices: number[],
    microSeeds: number[],
    width: number,
  ): MicroCell[] {
    const seedXArr = new Float64Array(microSeeds.length);
    const seedYArr = new Float64Array(microSeeds.length);

    for (let i = 0; i < microSeeds.length; i++) {
      const sIdx = microSeeds[i]!;
      seedXArr[i] = sIdx % width;
      seedYArr[i] = Math.floor(sIdx / width);
    }

    const cellPixelsMap = new Map<number, number[]>();
    for (let i = 0; i < microSeeds.length; i++) {
      cellPixelsMap.set(i, []);
    }

    for (let i = 0; i < allPixelIndices.length; i++) {
      const pIdx = allPixelIndices[i]!;
      const px = pIdx % width;
      const py = Math.floor(pIdx / width);

      let minDistance = Infinity;
      let bestCellId = 0;

      for (let s = 0; s < microSeeds.length; s++) {
        const dx = px - seedXArr[s]!;
        const dy = py - seedYArr[s]!;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistance) {
          minDistance = distSq;
          bestCellId = s;
        }
      }

      cellPixelsMap.get(bestCellId)!.push(pIdx);
    }

    const microCells: MicroCell[] = [];

    for (let i = 0; i < microSeeds.length; i++) {
      const pixels = cellPixelsMap.get(i) || [];
      if (pixels.length === 0) continue;

      let sumX = 0;
      let sumY = 0;
      for (let j = 0; j < pixels.length; j++) {
        const idx = pixels[j]!;
        sumX += idx % width;
        sumY += Math.floor(idx / width);
      }

      microCells.push({
        id: i,
        pixels,
        centroidX: Math.floor(sumX / pixels.length),
        centroidY: Math.floor(sumY / pixels.length),
      });
    }

    return microCells;
  }

  private static clusterMicroCellsToProvinces(
    microCells: MicroCell[],
    assignedProvinceIds: number[],
  ): Map<number, number> {
    const microToProvinceMap = new Map<number, number>();
    const targetK = assignedProvinceIds.length;

    if (microCells.length <= targetK) {
      for (let i = 0; i < microCells.length; i++) {
        const pid = assignedProvinceIds[i % targetK]!;
        microToProvinceMap.set(microCells[i]!.id, pid);
      }
      return microToProvinceMap;
    }

    let provXArr = new Float64Array(targetK);
    let provYArr = new Float64Array(targetK);

    for (let k = 0; k < targetK; k++) {
      const stepIdx = Math.floor(
        (k * microCells.length) / Math.max(1, targetK),
      );
      const cell = microCells[stepIdx]!;
      provXArr[k] = cell.centroidX;
      provYArr[k] = cell.centroidY;
    }

    const iterations = 6;
    let provCellAssignment = new Int32Array(microCells.length);

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < microCells.length; i++) {
        const cell = microCells[i]!;
        let minDist = Infinity;
        let bestK = 0;

        for (let k = 0; k < targetK; k++) {
          const dx = cell.centroidX - provXArr[k]!;
          const dy = cell.centroidY - provYArr[k]!;
          const dSq = dx * dx + dy * dy;

          if (dSq < minDist) {
            minDist = dSq;
            bestK = k;
          }
        }

        provCellAssignment[i] = bestK;
      }

      if (iter < iterations - 1) {
        const sumX = new Float64Array(targetK);
        const sumY = new Float64Array(targetK);
        const counts = new Int32Array(targetK);

        for (let i = 0; i < microCells.length; i++) {
          const k = provCellAssignment[i]!;
          const cell = microCells[i]!;
          sumX[k] += cell.centroidX * cell.pixels.length;
          sumY[k] += cell.centroidY * cell.pixels.length;
          counts[k] += cell.pixels.length;
        }

        for (let k = 0; k < targetK; k++) {
          const cnt = counts[k]!;
          if (cnt > 0) {
            provXArr[k] = sumX[k]! / cnt;
            provYArr[k] = sumY[k]! / cnt;
          }
        }
      }
    }

    for (let i = 0; i < microCells.length; i++) {
      const k = provCellAssignment[i]!;
      const pid = assignedProvinceIds[k]!;
      microToProvinceMap.set(microCells[i]!.id, pid);
    }

    return microToProvinceMap;
  }
}
