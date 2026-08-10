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
  private static calculateMildCurvature(x: number, y: number): number {
    return Math.sin(x * 0.02 + y * 0.02) * 2.0;
  }

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
    for (let i = 0; i < allPixelIndices.length; i++) {
      landMask[allPixelIndices[i]!] = 1;
    }

    let currentSeeds = [...initialSeeds];
    const iterations = 3;
    let finalAssignmentMap = new Map<number, number>();

    for (let iter = 0; iter < iterations; iter++) {
      finalAssignmentMap = this.runStrictLandPathDijkstra(
        allPixelIndices,
        currentSeeds,
        assignedProvinceIds,
        landMask,
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

  private static runStrictLandPathDijkstra(
    allPixelIndices: number[],
    seeds: number[],
    assignedProvinceIds: number[],
    landMask: Uint8Array,
    width: number,
    totalMapPixels: number,
  ): Map<number, number> {
    const assignmentMap = new Map<number, number>();
    const distMap = new Float64Array(totalMapPixels);
    distMap.fill(Infinity);

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

        if (nx >= 0 && nx < width && ny >= 0) {
          const nIdx = ny * width + nx;
          if (nIdx < totalMapPixels && landMask[nIdx] === 1) {
            const curve = this.calculateMildCurvature(nx, ny);
            const nextDist = currDist + off.cost + curve;

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
