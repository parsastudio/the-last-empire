import { MajorLandMass } from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";

export class ProvinceCountAllocator {
  public static readonly MIN_PIXELS_PER_PROVINCE = 2500;

  public static calculateTotalProvinces(totalPixels: number): number {
    if (totalPixels < this.MIN_PIXELS_PER_PROVINCE) {
      return 1;
    }
    const ratio = totalPixels / this.MIN_PIXELS_PER_PROVINCE;
    const baseCount = 1 + 1.2 * Math.log2(ratio) + 0.18 * Math.pow(ratio, 0.75);
    const count = Math.round(baseCount);
    return Math.max(1, Math.min(25, count));
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

    if (majorMasses.length === 1 || totalK <= 1) {
      allocations.set(majorMasses[0]!.id, totalK);
      for (let i = 1; i < majorMasses.length; i++) {
        allocations.set(majorMasses[i]!.id, 1);
      }
      return allocations;
    }

    const majorTotalPixels = majorMasses.reduce(
      (sum, m) => sum + m.totalPixels,
      0,
    );
    let assignedK = 0;

    for (let i = 0; i < majorMasses.length; i++) {
      const mass = majorMasses[i]!;
      if (mass.totalPixels < 1500) {
        allocations.set(mass.id, 1);
        assignedK += 1;
      } else if (i === majorMasses.length - 1) {
        const lastShare = Math.max(1, totalK - assignedK);
        allocations.set(mass.id, lastShare);
      } else {
        const rawShare = Math.floor(
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
