export class LootCalculator {
  public calculateLoot(
    targetTreasury: number,
    pocketSize: number,
    targetMainlandSize: number,
    baseSeizeRate = 0.25,
  ): number {
    if (targetMainlandSize <= 0) {
      return 0;
    }
    const sizeRatio = pocketSize / targetMainlandSize;
    const rawLoot = targetTreasury * sizeRatio * baseSeizeRate;
    return Math.max(0, Math.floor(rawLoot));
  }
}
