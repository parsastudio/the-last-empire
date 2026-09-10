import { LandComponent } from "@/infrastructure/core/types/map-pipeline.types";

export class ShoreDistanceUtility {
  public static computeMinShoreDistance(
    compA: LandComponent,
    compB: LandComponent,
    width: number,
  ): number {
    let minD = Infinity;
    const stepA = Math.max(1, Math.floor(compA.pixelIndices.length / 40));
    const stepB = Math.max(1, Math.floor(compB.pixelIndices.length / 40));

    for (let i = 0; i < compA.pixelIndices.length; i += stepA) {
      const idxA = compA.pixelIndices[i]!;
      const ax = idxA % width;
      const ay = Math.floor(idxA / width);

      for (let j = 0; j < compB.pixelIndices.length; j += stepB) {
        const idxB = compB.pixelIndices[j]!;
        const bx = idxB % width;
        const by = Math.floor(idxB / width);

        const rawDx = Math.abs(ax - bx);
        const dx = Math.min(rawDx, width - rawDx);
        const dy = ay - by;
        const dist = Math.hypot(dx, dy);

        if (dist < minD) {
          minD = dist;
          if (minD <= 2) return minD;
        }
      }
    }
    return minD;
  }
}
