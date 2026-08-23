import { BitPackedBuffer } from "@geopolitics/domain";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/core/types/map-pipeline.types";
import { GeodesicDijkstra } from "@/infrastructure/strategic-pipeline/03-partitioning/geodesic-dijkstra";

export class LloydRelaxationEngine {
  public static partitionAndRelax(
    allPixelIndices: number[],
    initialSeeds: number[],
    assignedProvinceIds: number[],
    group: ArchipelagoGroup,
    width: number,
    height: number,
    bitBuffer: BitPackedBuffer,
    provinceMap: Map<number, ProvinceClusterInfo>,
  ): void {
    if (allPixelIndices.length === 0 || initialSeeds.length === 0) {
      return;
    }

    const totalMapPixels = width * height;
    const landMask = new Uint8Array(totalMapPixels);
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      landMask[idx] = 1;
      const px = idx % width;
      const py = Math.floor(idx / width);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }

    const startX = Math.max(0, minX - 10);
    const endX = Math.min(width - 1, maxX + 10);
    const startY = Math.max(0, minY - 10);
    const endY = Math.min(height - 1, maxY + 10);

    let currentSeeds = [...initialSeeds];
    const iterations = 3;
    let finalAssignmentMap = new Map<number, number>();

    const distMap = new Float32Array(totalMapPixels);

    for (let iter = 0; iter < iterations; iter++) {
      finalAssignmentMap = GeodesicDijkstra.runPureLandDijkstra(
        allPixelIndices,
        currentSeeds,
        assignedProvinceIds,
        landMask,
        distMap,
        startX,
        endX,
        startY,
        endY,
        width,
        totalMapPixels,
      );

      if (iter < iterations - 1) {
        currentSeeds = GeodesicDijkstra.calculateCentroidSeeds(
          allPixelIndices,
          finalAssignmentMap,
          assignedProvinceIds,
          width,
        );
      }
    }

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

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const pid = finalAssignmentMap.get(idx) || defaultPid;
      const x = idx % width;
      const y = Math.floor(idx / width);

      bitBuffer.setPixel(x, y, pid);

      counts.set(pid, (counts.get(pid) || 0) + 1);
      sumXMap.set(pid, (sumXMap.get(pid) || 0) + x);
      sumYMap.set(pid, (sumYMap.get(pid) || 0) + y);
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
}
