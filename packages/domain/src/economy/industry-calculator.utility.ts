import { FactoryBatch } from "@/domain/economy/factory-batch.schema";
import { Province } from "@/domain/province/province.schema";

export class IndustryCalculator {
  public static readonly BASE_FACTORY_YIELD = 5_000_000_000;
  public static readonly SUBSISTENCE_YIELD = 0;
  public static readonly YIELD_TECH_BASE = 2.0;
  public static readonly FACTORY_REBUILD_COST = 30_000_000_000;
  public static readonly RESEARCH_BASE_COST = 200_000_000_000;
  public static readonly RESEARCH_GROWTH_BASE = 2.5;
  public static readonly RESEARCH_STEP = 0.1;
  public static readonly MACHINERY_BASE_UNIT_PRICE = 10_000_000_000;
  public static readonly IMPORT_BASE_PRICE = 10_000_000_000;
  public static readonly IMPORT_TECH_GAP_BASE = 2.0;

  public static calculateFactoryYield(techLevel: number): number {
    return Math.floor(
      this.BASE_FACTORY_YIELD * Math.pow(this.YIELD_TECH_BASE, techLevel - 1),
    );
  }

  public static calculateBatchesTotalYield(batches?: FactoryBatch[]): number {
    if (!batches || batches.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < batches.length; i++) {
      const b = batches[i]!;
      total += b.count * this.calculateFactoryYield(b.techLevel);
    }
    return total;
  }

  public static calculateStartingTotalFactories(
    startingGdp: number,
    industrialLevel: number,
  ): number {
    const yieldPerFactory = this.calculateFactoryYield(industrialLevel);
    return Math.max(1, Math.round(startingGdp / yieldPerFactory));
  }

  public static calculateHeadroomRatio(
    gdpRank: number,
    totalNationsCount: number,
  ): number {
    const safeTotal = Math.max(1, totalNationsCount);
    const midpoint = safeTotal / 2;
    if (gdpRank <= midpoint) {
      return 0.0;
    }
    const rankDelta = gdpRank - midpoint;
    const ratio = (rankDelta / midpoint) * 2.0;
    return Number(Math.min(2.0, Math.max(0, ratio)).toFixed(2));
  }

  public static calculateStartingMaxSlots(
    activeFactories: number,
    gdpRank: number,
    totalNationsCount: number,
  ): number {
    const headroomRatio = this.calculateHeadroomRatio(
      gdpRank,
      totalNationsCount,
    );
    const calculatedMax = Math.ceil(activeFactories * (1 + headroomRatio));
    return Math.max(activeFactories, Math.max(3, calculatedMax));
  }

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
      maxSlots: number;
    }[],
    quantity: number,
  ): Map<number, number> {
    const allocations = new Map<number, number>();
    if (quantity <= 0 || provinces.length === 0) return allocations;

    const candidates = provinces
      .filter((p) => p.maxSlots > p.factoriesCount)
      .map((p) => ({
        provinceId: p.provinceId,
        current: p.factoriesCount,
        max: p.maxSlots,
        added: 0,
      }));

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

  public static distributeFactoryDestruction(
    provincesMap: Record<string, Province>,
    candidateProvinces: Province[],
    factoriesToDestroy: number,
  ): { updatedProvinces: Record<string, Province>; actualDestroyed: number } {
    if (factoriesToDestroy <= 0 || candidateProvinces.length === 0) {
      return { updatedProvinces: provincesMap, actualDestroyed: 0 };
    }

    const updatedProvinces: Record<string, Province> = { ...provincesMap };
    let totalPoolFactories = 0;

    for (let i = 0; i < candidateProvinces.length; i++) {
      totalPoolFactories += candidateProvinces[i]!.factoriesCount;
    }

    if (totalPoolFactories <= 0) {
      return { updatedProvinces: provincesMap, actualDestroyed: 0 };
    }

    const minProtectedFloor = Math.max(1, Math.ceil(totalPoolFactories * 0.05));
    const maxDestroyable = Math.max(0, totalPoolFactories - minProtectedFloor);
    const actualDestroyCount = Math.min(factoriesToDestroy, maxDestroyable);

    if (actualDestroyCount <= 0) {
      return { updatedProvinces: provincesMap, actualDestroyed: 0 };
    }

    let remainingToDeduct = actualDestroyCount;
    const sortedProvinces = [...candidateProvinces].sort(
      (a, b) => b.factoriesCount - a.factoriesCount,
    );

    for (let i = 0; i < sortedProvinces.length && remainingToDeduct > 0; i++) {
      const p = sortedProvinces[i]!;
      const currentCount = p.factoriesCount;
      if (currentCount <= 0) continue;

      const proportionalShare = Math.floor(
        (currentCount / totalPoolFactories) * actualDestroyCount,
      );
      const deduct = Math.max(
        1,
        Math.min(currentCount, Math.min(remainingToDeduct, proportionalShare)),
      );

      const nextBatches = this.removeFactories(p.factoryTiers, deduct);
      const nextCount = currentCount - deduct;

      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        factoriesCount: nextCount,
        factoryTiers: nextBatches,
      };

      remainingToDeduct -= deduct;
    }

    let loopIndex = 0;
    while (remainingToDeduct > 0 && loopIndex < sortedProvinces.length) {
      const p = sortedProvinces[loopIndex]!;
      const current = updatedProvinces[p.provinceId.toString()]!;
      if (current.factoriesCount > 0) {
        const nextBatches = this.removeFactories(current.factoryTiers, 1);
        updatedProvinces[p.provinceId.toString()] = {
          ...current,
          factoriesCount: current.factoriesCount - 1,
          factoryTiers: nextBatches,
        };
        remainingToDeduct--;
      }
      loopIndex++;
    }

    return {
      updatedProvinces,
      actualDestroyed: actualDestroyCount - remainingToDeduct,
    };
  }

  public static calculateProvinceGdp(
    province: {
      maxSlots?: number;
      factoriesCount?: number;
      factoryTiers?: FactoryBatch[];
    },
    fallbackTechLevel = 1.0,
  ): number {
    if (province.factoryTiers && province.factoryTiers.length > 0) {
      return this.calculateBatchesTotalYield(province.factoryTiers);
    }
    const activeFactories = province.factoriesCount ?? 1;
    const activeYield =
      activeFactories * this.calculateFactoryYield(fallbackTechLevel);
    return Math.floor(activeYield);
  }

  public static calculateModernizeUnitCost(
    currentEquipmentTech: number,
    targetTech: number,
  ): number {
    const delta = Math.max(0, targetTech - currentEquipmentTech);
    if (delta <= 0) return 0;
    return Math.floor(this.MACHINERY_BASE_UNIT_PRICE * delta);
  }

  public static calculateEquipmentImportPrice(
    sellerIndustrialTech: number,
    currentEquipmentTech: number,
    buyerDomesticIndustrialTech: number,
  ): number {
    const upgradeDelta = Math.max(
      0,
      sellerIndustrialTech - currentEquipmentTech,
    );
    if (upgradeDelta <= 0) return 0;
    const baseUnitCost = this.calculateModernizeUnitCost(
      currentEquipmentTech,
      sellerIndustrialTech,
    );
    const countryTechGap = Math.max(
      0,
      sellerIndustrialTech - buyerDomesticIndustrialTech,
    );
    const importMultiplier = Math.pow(
      this.IMPORT_TECH_GAP_BASE,
      countryTechGap,
    );
    return Math.floor(baseUnitCost * importMultiplier);
  }

  public static calculateResearchStepCost(industrialLevel: number): number {
    const k = Math.floor(industrialLevel);
    const fullTierCost =
      this.RESEARCH_BASE_COST * Math.pow(this.RESEARCH_GROWTH_BASE, k - 1);
    return Math.floor(fullTierCost / 10);
  }

  public static consolidateBatches(batches?: FactoryBatch[]): FactoryBatch[] {
    if (!batches || batches.length === 0) return [];
    const map = new Map<number, number>();

    for (const b of batches) {
      if (b.count <= 0) continue;
      const roundedTech = Number(b.techLevel.toFixed(2));
      const current = map.get(roundedTech) || 0;
      map.set(roundedTech, current + b.count);
    }

    return Array.from(map.entries())
      .map(([techLevel, count]) => ({ techLevel, count }))
      .sort((a, b) => a.techLevel - b.techLevel);
  }

  public static calculateWeightedAverageTech(
    batches?: FactoryBatch[],
    fallback = 1.0,
  ): number {
    const consolidated = this.consolidateBatches(batches);
    let totalCount = 0;
    let weightedSum = 0;

    for (const b of consolidated) {
      totalCount += b.count;
      weightedSum += b.count * b.techLevel;
    }

    if (totalCount === 0) return fallback;
    return Number((weightedSum / totalCount).toFixed(2));
  }

  public static addFactories(
    batches: FactoryBatch[] | undefined,
    count: number,
    techLevel: number,
  ): FactoryBatch[] {
    const list = batches ? [...batches] : [];
    if (count <= 0) return this.consolidateBatches(list);
    list.push({ techLevel: Number(techLevel.toFixed(2)), count });
    return this.consolidateBatches(list);
  }

  public static removeFactories(
    batches: FactoryBatch[] | undefined,
    countToRemove: number,
  ): FactoryBatch[] {
    const consolidated = this.consolidateBatches(batches);
    if (countToRemove <= 0 || consolidated.length === 0) return consolidated;

    let remainingToRemove = countToRemove;
    const result: FactoryBatch[] = [];

    for (const batch of consolidated) {
      if (remainingToRemove <= 0) {
        result.push(batch);
        continue;
      }

      if (batch.count <= remainingToRemove) {
        remainingToRemove -= batch.count;
      } else {
        result.push({
          techLevel: batch.techLevel,
          count: batch.count - remainingToRemove,
        });
        remainingToRemove = 0;
      }
    }

    return this.consolidateBatches(result);
  }

  public static mergeBatches(
    batchesA?: FactoryBatch[],
    batchesB?: FactoryBatch[],
  ): FactoryBatch[] {
    const combined: FactoryBatch[] = [];
    if (batchesA) combined.push(...batchesA);
    if (batchesB) combined.push(...batchesB);
    return this.consolidateBatches(combined);
  }

  public static upgradeLowestFactories(
    batches: FactoryBatch[] | undefined,
    upgradeCount: number,
    targetTech: number,
  ): FactoryBatch[] {
    const consolidated = this.consolidateBatches(batches);
    if (upgradeCount <= 0 || consolidated.length === 0) return consolidated;

    let remainingToUpgrade = upgradeCount;
    const result: FactoryBatch[] = [];
    let upgradedTotal = 0;

    for (const batch of consolidated) {
      if (batch.techLevel >= targetTech || remainingToUpgrade <= 0) {
        result.push(batch);
        continue;
      }

      const countToTake = Math.min(batch.count, remainingToUpgrade);
      const unchangedCount = batch.count - countToTake;

      if (unchangedCount > 0) {
        result.push({ techLevel: batch.techLevel, count: unchangedCount });
      }

      upgradedTotal += countToTake;
      remainingToUpgrade -= countToTake;
    }

    if (upgradedTotal > 0) {
      result.push({
        techLevel: Number(targetTech.toFixed(2)),
        count: upgradedTotal,
      });
    }

    return this.consolidateBatches(result);
  }
}
