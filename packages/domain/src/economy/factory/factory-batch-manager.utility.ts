import { FactoryBatch } from "@/domain/economy/factory-batch.schema";

export class FactoryBatchManagerUtility {
  public static readonly INDUSTRIAL_FLOOR_DELTA = 1.2;

  public static getIndustrialFloor(industrialLevel: number): number {
    return Math.max(
      1.0,
      Number((industrialLevel - this.INDUSTRIAL_FLOOR_DELTA).toFixed(2)),
    );
  }

  public static applyIndustrialFloor(
    batches: FactoryBatch[] | undefined,
    industrialLevel: number,
  ): FactoryBatch[] {
    const floor = this.getIndustrialFloor(industrialLevel);
    const consolidated = this.consolidateBatches(batches);
    if (consolidated.length === 0) return [];

    let modified = false;
    const result: FactoryBatch[] = [];

    for (let i = 0; i < consolidated.length; i++) {
      const b = consolidated[i]!;
      if (b.techLevel < floor) {
        result.push({ techLevel: floor, count: b.count });
        modified = true;
      } else {
        result.push(b);
      }
    }

    return modified ? this.consolidateBatches(result) : consolidated;
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
