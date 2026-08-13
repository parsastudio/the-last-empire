import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  ArchipelagoGroup,
  ProvinceClusterInfo,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

class LandMinHeap {
  private nodes: { idx: number; dist: number }[] = [];

  public push(idx: number, dist: number): void {
    this.nodes.push({ idx, dist });
    this.bubbleUp(this.nodes.length - 1);
  }

  public pop(): { idx: number; dist: number } | undefined {
    if (this.nodes.length === 0) return undefined;
    const top = this.nodes[0]!;
    const bottom = this.nodes.pop()!;
    if (this.nodes.length > 0) {
      this.nodes[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  public size(): number {
    return this.nodes.length;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.nodes[i]!.dist < this.nodes[p]!.dist) {
        const tmp = this.nodes[i]!;
        this.nodes[i] = this.nodes[p]!;
        this.nodes[p] = tmp;
        i = p;
      } else {
        break;
      }
    }
  }

  private sinkDown(i: number): void {
    const len = this.nodes.length;
    while (true) {
      const left = (i << 1) + 1;
      const right = left + 1;
      let smallest = i;

      if (left < len && this.nodes[left]!.dist < this.nodes[smallest]!.dist) {
        smallest = left;
      }
      if (right < len && this.nodes[right]!.dist < this.nodes[smallest]!.dist) {
        smallest = right;
      }

      if (smallest !== i) {
        const tmp = this.nodes[i]!;
        this.nodes[i] = this.nodes[smallest]!;
        this.nodes[smallest] = tmp;
        i = smallest;
      } else {
        break;
      }
    }
  }
}

export class GeodesicVoronoiPartitioner {
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
      finalAssignmentMap = this.runPureLandDijkstra(
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
        currentSeeds = this.calculateCentroidSeeds(
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

  private static runPureLandDijkstra(
    allPixelIndices: number[],
    seeds: number[],
    assignedProvinceIds: number[],
    landMask: Uint8Array,
    distMap: Float32Array,
    startX: number,
    endX: number,
    startY: number,
    endY: number,
    width: number,
    totalMapPixels: number,
  ): Map<number, number> {
    const assignmentMap = new Map<number, number>();

    for (let y = startY; y <= endY; y++) {
      const rowOffset = y * width;
      for (let x = startX; x <= endX; x++) {
        distMap[rowOffset + x] = 1e9;
      }
    }

    const heap = new LandMinHeap();

    for (let s = 0; s < seeds.length; s++) {
      const seedIdx = seeds[s]!;
      const pid = assignedProvinceIds[s]!;
      distMap[seedIdx] = 0;
      assignmentMap.set(seedIdx, pid);
      heap.push(seedIdx, 0);
    }

    const neighborOffsets = [
      { dx: 1, dy: 0, cost: 1000 },
      { dx: -1, dy: 0, cost: 1000 },
      { dx: 0, dy: 1, cost: 1000 },
      { dx: 0, dy: -1, cost: 1000 },
      { dx: 1, dy: 1, cost: 1414 },
      { dx: -1, dy: -1, cost: 1414 },
      { dx: 1, dy: -1, cost: 1414 },
      { dx: -1, dy: 1, cost: 1414 },
    ];

    while (heap.size() > 0) {
      const item = heap.pop()!;
      const currIdx = item.idx;
      const currDist = item.dist;

      if (currDist > distMap[currIdx]!) continue;

      const currPid = assignmentMap.get(currIdx)!;
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);

      for (let k = 0; k < 8; k++) {
        const off = neighborOffsets[k]!;
        const nx = cx + off.dx;
        const ny = cy + off.dy;

        if (nx >= startX && nx <= endX && ny >= startY && ny <= endY) {
          const nIdx = ny * width + nx;
          if (nIdx < totalMapPixels && landMask[nIdx] === 1) {
            const nextDist = currDist + off.cost;

            if (nextDist < distMap[nIdx]!) {
              distMap[nIdx] = nextDist;
              assignmentMap.set(nIdx, currPid);
              heap.push(nIdx, nextDist);
            }
          }
        }
      }
    }

    const defaultPid = assignedProvinceIds[0]!;
    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      if (!assignmentMap.has(idx)) {
        assignmentMap.set(idx, defaultPid);
      }
    }

    return assignmentMap;
  }

  private static calculateCentroidSeeds(
    allPixelIndices: number[],
    assignmentMap: Map<number, number>,
    assignedProvinceIds: number[],
    width: number,
  ): number[] {
    const provincePixelsMap = new Map<number, number[]>();
    for (let i = 0; i < assignedProvinceIds.length; i++) {
      provincePixelsMap.set(assignedProvinceIds[i]!, []);
    }

    for (let i = 0; i < allPixelIndices.length; i++) {
      const idx = allPixelIndices[i]!;
      const pid = assignmentMap.get(idx);
      if (pid && provincePixelsMap.has(pid)) {
        provincePixelsMap.get(pid)!.push(idx);
      }
    }

    const newSeeds: number[] = [];

    for (let i = 0; i < assignedProvinceIds.length; i++) {
      const pid = assignedProvinceIds[i]!;
      const pixels = provincePixelsMap.get(pid) || [];

      if (pixels.length === 0) {
        newSeeds.push(allPixelIndices[0]!);
        continue;
      }

      let sumX = 0;
      let sumY = 0;
      for (let j = 0; j < pixels.length; j++) {
        const pIdx = pixels[j]!;
        sumX += pIdx % width;
        sumY += Math.floor(pIdx / width);
      }

      const avgX = Math.floor(sumX / pixels.length);
      const avgY = Math.floor(sumY / pixels.length);

      let bestSeed = pixels[0]!;
      let minDistSq = Infinity;

      for (let j = 0; j < pixels.length; j++) {
        const pIdx = pixels[j]!;
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);
        const distSq = (px - avgX) * (px - avgX) + (py - avgY) * (py - avgY);
        if (distSq < minDistSq) {
          minDistSq = distSq;
          bestSeed = pIdx;
        }
      }

      newSeeds.push(bestSeed);
    }

    return newSeeds;
  }
}
