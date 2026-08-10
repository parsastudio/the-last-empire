import { LandComponent } from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export interface MajorLandMass {
  id: number;
  components: LandComponent[];
  totalPixels: number;
  centerX: number;
  centerY: number;
}

export class ProvinceCountAllocator {
  public static calculateTotalProvinces(totalPixels: number): number {
    if (totalPixels < 500) return 1;
    const count = Math.floor(1 + 7.5 * Math.log10(totalPixels / 500));
    return Math.max(1, Math.min(60, count));
  }

  public static allocateProvincesToMasses(
    majorMasses: MajorLandMass[],
    totalPixels: number,
  ): Map<number, number> {
    const allocations = new Map<number, number>();
    if (majorMasses.length === 0) {
      return allocations;
    }

    const totalK = this.calculateTotalProvinces(totalPixels);
    if (majorMasses.length === 1) {
      allocations.set(majorMasses[0]!.id, totalK);
      return allocations;
    }

    const majorTotalPixels = majorMasses.reduce(
      (sum, m) => sum + m.totalPixels,
      0,
    );
    let remainingK = totalK;
    let assignedK = 0;

    for (let i = 0; i < majorMasses.length; i++) {
      const mass = majorMasses[i]!;
      if (i === majorMasses.length - 1) {
        const lastShare = Math.max(1, remainingK - assignedK);
        allocations.set(mass.id, lastShare);
      } else {
        const rawShare = Math.round(
          (mass.totalPixels / (majorTotalPixels || 1)) * totalK,
        );
        const share = Math.max(1, rawShare);
        allocations.set(mass.id, share);
        assignedK += share;
      }
    }

    return allocations;
  }
}
