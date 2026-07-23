export class TechLevelCalculator {
  public getTechCombatMultiplier(techLevel: number): number {
    const baseMult = 1.0;
    const bonusPerLevel = 0.15;
    return Number((baseMult + (techLevel - 1) * bonusPerLevel).toFixed(2));
  }
}
