import {
  CoastalShorelinePixel,
  MaritimeDistancePair,
} from "@/infrastructure/maritime-topology/core/maritime-topology.types";
import { BitPackedCellUtility } from "@geopolitics/domain";
import { MaritimeWaterGridBuilder } from "@/infrastructure/maritime-topology/algorithms/maritime-water-grid-builder";

export class BoundedWaterBfs {
  private static readonly MAX_SEARCH_DISTANCE = 1500;
  private static readonly TIER_1_DISTANCE = 500;
  private static readonly MAX_BUCKET = 1520;
  private static readonly MAX_QUEUE_PER_BUCKET = 35000;

  private width = MaritimeWaterGridBuilder.TOPOLOGY_WIDTH;
  private height = MaritimeWaterGridBuilder.TOPOLOGY_HEIGHT;
  private totalPixels = this.width * this.height;

  private distGrid = new Int32Array(this.totalPixels);
  private visitTokens = new Int32Array(this.totalPixels);
  private currentToken = 0;

  private bucketHeads = new Int32Array(BoundedWaterBfs.MAX_BUCKET);
  private bucketTails = new Int32Array(BoundedWaterBfs.MAX_BUCKET);
  private bucketBuffers: Int32Array[];

  private neighborOffsets = [
    { dx: 1, dy: 0, cost: 10 },
    { dx: -1, dy: 0, cost: 10 },
    { dx: 0, dy: 1, cost: 10 },
    { dx: 0, dy: -1, cost: 10 },
    { dx: 1, dy: 1, cost: 14 },
    { dx: -1, dy: -1, cost: 14 },
    { dx: 1, dy: -1, cost: 14 },
    { dx: -1, dy: 1, cost: 14 },
  ];

  constructor() {
    this.bucketBuffers = [];
    for (let i = 0; i < BoundedWaterBfs.MAX_BUCKET; i++) {
      this.bucketBuffers.push(
        new Int32Array(BoundedWaterBfs.MAX_QUEUE_PER_BUCKET),
      );
    }
  }

  public findMaritimeNeighborsForProvince(
    sourceProvinceId: number,
    shorelineWaterPixels: CoastalShorelinePixel[],
    grid: Uint16Array,
  ): {
    tier1Neighbors: MaritimeDistancePair[];
    tier2Neighbors: MaritimeDistancePair[];
  } {
    this.currentToken++;
    const token = this.currentToken;

    for (let i = 0; i < BoundedWaterBfs.MAX_BUCKET; i++) {
      this.bucketHeads[i] = 0;
      this.bucketTails[i] = 0;
    }

    const bucket0 = this.bucketBuffers[0]!;
    for (let i = 0; i < shorelineWaterPixels.length; i++) {
      const p = shorelineWaterPixels[i]!;
      const idx = p.y * this.width + p.x;
      this.distGrid[idx] = 0;
      this.visitTokens[idx] = token;
      const tail = this.bucketTails[0]!;
      if (tail < BoundedWaterBfs.MAX_QUEUE_PER_BUCKET) {
        bucket0[tail] = idx;
        this.bucketTails[0] = tail + 1;
      }
    }

    const minDistanceMap = new Map<number, number>();
    let currentBucketDist = 0;

    while (currentBucketDist < BoundedWaterBfs.MAX_SEARCH_DISTANCE) {
      const head = this.bucketHeads[currentBucketDist]!;
      const tail = this.bucketTails[currentBucketDist]!;

      if (head >= tail) {
        currentBucketDist++;
        continue;
      }

      const bucket = this.bucketBuffers[currentBucketDist]!;
      const currIdx = bucket[head]!;
      this.bucketHeads[currentBucketDist] = head + 1;

      if (currentBucketDist > this.distGrid[currIdx]!) continue;

      const cx = currIdx % this.width;
      const cy = Math.floor(currIdx / this.width);

      for (let k = 0; k < 8; k++) {
        const off = this.neighborOffsets[k]!;
        const nx = (cx + off.dx + this.width) % this.width;
        const ny = cy + off.dy;

        if (ny < 0 || ny >= this.height) continue;

        const nIdx = ny * this.width + nx;
        const rawCell = grid[nIdx]! & 0x0fff;

        if (
          rawCell >= BitPackedCellUtility.FIRST_PROVINCE_ID &&
          rawCell !== sourceProvinceId
        ) {
          const recorded = minDistanceMap.get(rawCell);
          if (recorded === undefined || currentBucketDist < recorded) {
            minDistanceMap.set(rawCell, currentBucketDist);
          }
          continue;
        }

        if (rawCell === BitPackedCellUtility.WATER_OCEAN_ID) {
          const nextDist = currentBucketDist + off.cost;
          if (nextDist <= BoundedWaterBfs.MAX_SEARCH_DISTANCE) {
            if (
              this.visitTokens[nIdx] !== token ||
              nextDist < this.distGrid[nIdx]!
            ) {
              this.visitTokens[nIdx] = token;
              this.distGrid[nIdx] = nextDist;
              const nextTail = this.bucketTails[nextDist]!;
              if (nextTail < BoundedWaterBfs.MAX_QUEUE_PER_BUCKET) {
                this.bucketBuffers[nextDist]![nextTail] = nIdx;
                this.bucketTails[nextDist] = nextTail + 1;
              }
            }
          }
        }
      }
    }

    const tier1Neighbors: MaritimeDistancePair[] = [];
    const tier2Neighbors: MaritimeDistancePair[] = [];

    for (const [targetPid, fixedDist] of minDistanceMap.entries()) {
      const realPixelDistance = Math.round(
        (fixedDist / 10) * MaritimeWaterGridBuilder.SCALE_FACTOR,
      );
      if (fixedDist <= BoundedWaterBfs.TIER_1_DISTANCE) {
        tier1Neighbors.push({
          targetProvinceId: targetPid,
          distancePixels: realPixelDistance,
        });
      } else {
        tier2Neighbors.push({
          targetProvinceId: targetPid,
          distancePixels: realPixelDistance,
        });
      }
    }

    tier1Neighbors.sort((a, b) => a.distancePixels - b.distancePixels);
    tier2Neighbors.sort((a, b) => a.distancePixels - b.distancePixels);

    return { tier1Neighbors, tier2Neighbors };
  }
}
