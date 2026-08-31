import { FactoryBatch } from "@/domain/economy/factory-batch.schema";

export class IndustryCalculator {
  public static readonly BASE_FACTORY_YIELD = 250_000_000;
  public static readonly SUBSISTENCE_YIELD = 125_000_000;
  public static readonly YIELD_TECH_BASE = 2.4;
  public static readonly FACTORY_REBUILD_COST = 1_000_000_000;
  public static readonly RESEARCH_BASE_COST = 20_000_000_000;
  public static readonly RESEARCH_STEP = 0.1;
  public static readonly MACHINERY_BASE_UNIT_PRICE = 2_000_000_000;
  public static readonly IMPORT_BASE_PRICE = 2_000_000_000;
  public static readonly LEVEL_SURCHARGE_RATE = 0.3;

  public static calculateFactoryYield(techLevel: number): number {
    return Math.floor(
      this.BASE_FACTORY_YIELD * Math.pow(this.YIELD_TECH_BASE, techLevel - 1),
    );
  }

  public static calculateStartingTotalFactories(
    startingGdp: number,
    industrialLevel: number,
  ): number {
    const yieldPerFactory = this.calculateFactoryYield(industrialLevel);
    return Math.max(1, Math.round(startingGdp / yieldPerFactory));
  }

  public static distributeFactoriesToProvinces(
    totalFactories: number,
    provincesCount: number,
  ): number[] {
    const safeCount = Math.max(1, provincesCount);
    const baseShare = Math.floor(totalFactories / safeCount);
    let remainder = totalFactories % safeCount;

    const distribution: number[] = [];
    for (let i = 0; i < safeCount; i++) {
      let slots = baseShare;
      if (remainder > 0) {
        slots += 1;
        remainder -= 1;
      }
      distribution.push(Math.max(1, slots));
    }
    return distribution;
  }

  public static calculateProvinceGdp(
    province: { maxSlots?: number; factoriesCount?: number },
    equipmentTechLevel = 1.0,
  ): number {
    const activeFactories = province.factoriesCount ?? 1;
    const maxSlots = province.maxSlots ?? activeFactories;
    const emptySlots = Math.max(0, maxSlots - activeFactories);

    const activeYield =
      activeFactories * this.calculateFactoryYield(equipmentTechLevel);
    const subsistenceYield = emptySlots * this.SUBSISTENCE_YIELD;

    return Math.floor(activeYield + subsistenceYield);
  }

  public static calculateModernizeUnitCost(
    currentEquipmentTech: number,
    targetTech: number,
  ): number {
    const delta = Math.max(0, targetTech - currentEquipmentTech);
    if (delta <= 0) return 0;
    return Math.floor(
      this.MACHINERY_BASE_UNIT_PRICE * delta * this.LEVEL_SURCHARGE_RATE,
    );
  }

  public static calculateResearchStepCost(industrialLevel: number): number {
    const k = Math.floor(industrialLevel);
    const fullTierCost = this.RESEARCH_BASE_COST * Math.pow(2.5, k - 1);
    return Math.floor(fullTierCost / 10);
  }

  public static calculateEquipmentImportPrice(
    sellerTech: number,
    buyerTech: number,
  ): number {
    return this.calculateModernizeUnitCost(buyerTech, sellerTech);
  }

  public static calculateNewEquipmentTechLevel(
    totalFactories: number,
    currentEquipmentTech: number,
    modernizedQuantity: number,
    targetTech: number,
  ): number {
    if (totalFactories <= 0 || targetTech <= currentEquipmentTech) {
      return currentEquipmentTech;
    }
    const safeQty = Math.min(totalFactories, Math.max(0, modernizedQuantity));
    const delta = targetTech - currentEquipmentTech;
    const increase = (safeQty / totalFactories) * delta;
    const finalLevel = Math.min(targetTech, currentEquipmentTech + increase);
    return Number(finalLevel.toFixed(2));
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

  public static calculateBatchesTotalYield(batches?: FactoryBatch[]): number {
    const consolidated = this.consolidateBatches(batches);
    let total = 0;
    for (const b of consolidated) {
      total += b.count * this.calculateFactoryYield(b.techLevel);
    }
    return total;
  }
}
