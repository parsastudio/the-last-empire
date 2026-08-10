import {
  ArchipelagoGroup,
  GroupProvinceAllocation,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class ProvinceCountAllocator {
  public static calculateTotalProvinces(totalPixels: number): number {
    if (totalPixels < 500) return 1;
    const count = Math.floor(1 + 3.5 * Math.log10(totalPixels / 500));
    return Math.max(1, Math.min(32, count));
  }

  public static allocateProvinces(
    groups: ArchipelagoGroup[],
    totalPixels: number,
  ): GroupProvinceAllocation[] {
    if (groups.length === 0) {
      return [];
    }

    const totalK = this.calculateTotalProvinces(totalPixels);
    const result: GroupProvinceAllocation[] = [];

    const viableGroups = groups.filter((g) => g.totalPixels >= 400);

    if (viableGroups.length === 0) {
      const largest = groups[0]!;
      result.push({ group: largest, provinceCount: 1 });
      for (let i = 1; i < groups.length; i++) {
        result.push({ group: groups[i]!, provinceCount: 0 });
      }
      return result;
    }

    let remainingK = totalK;
    const allocations = new Map<number, number>();

    for (const g of viableGroups) {
      if (g.totalPixels < 2000) {
        allocations.set(g.id, 1);
        remainingK--;
      } else {
        allocations.set(g.id, 0);
      }
    }

    if (remainingK <= 0) {
      for (const g of viableGroups) {
        if (allocations.get(g.id) === 0) {
          allocations.set(g.id, 1);
        }
      }
    } else {
      const largeGroups = viableGroups.filter((g) => g.totalPixels >= 2000);

      if (largeGroups.length === 0) {
        const topGroup = viableGroups[0]!;
        allocations.set(
          topGroup.id,
          (allocations.get(topGroup.id) || 1) + remainingK,
        );
      } else {
        const largeTotalPixels = largeGroups.reduce(
          (s, g) => s + g.totalPixels,
          0,
        );
        let allocatedCount = 0;

        for (let i = 0; i < largeGroups.length; i++) {
          const g = largeGroups[i]!;
          if (i === largeGroups.length - 1) {
            const share = remainingK - allocatedCount;
            allocations.set(g.id, Math.max(1, share));
          } else {
            const rawShare = Math.round(
              (g.totalPixels / largeTotalPixels) * remainingK,
            );
            const share = Math.max(1, rawShare);
            allocations.set(g.id, share);
            allocatedCount += share;
          }
        }
      }
    }

    for (const g of groups) {
      const count = allocations.get(g.id) || 0;
      result.push({ group: g, provinceCount: count });
    }

    return result;
  }
}
