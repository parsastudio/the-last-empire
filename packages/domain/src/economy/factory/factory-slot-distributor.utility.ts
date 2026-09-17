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

    if (candidates.length === 0) return allocations;

    let remaining = quantity;

    while (remaining > 0) {
      let minTotal = Infinity;
      let minCount = 0;

      for (let i = 0; i < candidates.length; i++) {
        const item = candidates[i]!;
        if (item.current + item.added < item.max) {
          const total = item.current + item.added;
          if (total < minTotal) {
            minTotal = total;
            minCount = 1;
          } else if (total === minTotal) {
            minCount++;
          }
        }
      }

      if (minTotal === Infinity || minCount === 0) {
        break;
      }

      let nextMin = Infinity;
      for (let i = 0; i < candidates.length; i++) {
        const item = candidates[i]!;
        if (item.current + item.added < item.max) {
          const total = item.current + item.added;
          if (total > minTotal && total < nextMin) {
            nextMin = total;
          }
        }
      }

      const stepCapacity =
        nextMin !== Infinity
          ? nextMin - minTotal
          : Math.ceil(remaining / minCount);
      const perCandidateAllocation = Math.max(
        1,
        Math.min(stepCapacity, Math.floor(remaining / minCount)),
      );

      let anyAllocated = false;

      for (let i = 0; i < candidates.length && remaining > 0; i++) {
        const item = candidates[i]!;
        const currentTotal = item.current + item.added;
        if (currentTotal === minTotal && currentTotal < item.max) {
          const availableRoom = item.max - currentTotal;
          const toAdd = Math.min(
            remaining,
            Math.min(availableRoom, perCandidateAllocation),
          );
          if (toAdd > 0) {
            item.added += toAdd;
            remaining -= toAdd;
            anyAllocated = true;
          }
        }
      }

      if (!anyAllocated) {
        for (let i = 0; i < candidates.length && remaining > 0; i++) {
          const item = candidates[i]!;
          if (item.current + item.added < item.max) {
            item.added += 1;
            remaining -= 1;
            anyAllocated = true;
          }
        }
        if (!anyAllocated) break;
      }
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
