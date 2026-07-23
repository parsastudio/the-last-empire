export class PocketCombatCalculator {
  public calculateStrengthRatio(
    pocketSize: number,
    mainlandSize: number,
  ): number {
    if (mainlandSize <= 0) {
      return 0;
    }
    return Number((pocketSize / mainlandSize).toFixed(4));
  }

  public getLogisticalCombatMultiplier(
    pocketSize: number,
    mainlandSize: number,
  ): number {
    const ratio = this.calculateStrengthRatio(pocketSize, mainlandSize);
    if (ratio < 0.2) {
      return 0.25;
    }
    return 1.0;
  }
}
