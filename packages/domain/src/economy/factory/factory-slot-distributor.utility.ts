import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export class FactorySlotDistributorUtility {
  public static distributeFactoriesAndSlotsToProvinces(
    totalActiveFactories: number,
    totalMaxSlots: number,
    provincesCount: number,
  ): { activeCount: number; maxSlots: number }[] {
    const safeCount = Math.max(1, provincesCount);
    const activeShare = Math.floor(totalActiveFactories / safeCount);
    let activeRemainder = totalActiveFactories % safeCount;

    const maxShare = Math.floor(totalMaxSlots / safeCount);
    let maxRemainder = totalMaxSlots % safeCount;

    const distribution: { activeCount: number; maxSlots: number }[] = [];

    for (let i = 0; i < safeCount; i++) {
      let active = activeShare;
      if (activeRemainder > 0) {
        active += 1;
        activeRemainder -= 1;
      }

      let max = maxShare;
      if (maxRemainder > 0) {
        max += 1;
        maxRemainder -= 1;
      }

      active = Math.max(1, active);
      max = Math.max(active, max);

      distribution.push({ activeCount: active, maxSlots: max });
    }

    return distribution;
  }

  public static distributeNewFactories(
    provinces: {
      provinceId: number;
      factoriesCount: number;
      maxSlots?: number;
    }[],
    quantity: number,
  ): Map<number, number> {
    const allocations = new Map<number, number>();
    if (quantity <= 0 || provinces.length === 0) return allocations;

    const candidates = provinces
      .map((p) => {
        const max =
          p.maxSlots ?? MapTopologyRegistry.getMaxSlots(p.provinceId, 1);
        return {
          provinceId: p.provinceId,
          current: p.factoriesCount,
          max,
          added: 0,
        };
      })
      .filter((p) => p.max > p.current);

    let remaining = quantity;
    while (remaining > 0) {
      candidates.sort((a, b) => a.current + a.added - (b.current + b.added));
      let allocated = false;

      for (let i = 0; i < candidates.length && remaining > 0; i++) {
        const item = candidates[i]!;
        if (item.current + item.added < item.max) {
          item.added += 1;
          remaining -= 1;
          allocated = true;
          break;
        }
      }

      if (!allocated) break;
    }

    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i]!;
      if (item.added > 0) {
        allocations.set(item.provinceId, item.added);
      }
    }

    return allocations;
  }
}
