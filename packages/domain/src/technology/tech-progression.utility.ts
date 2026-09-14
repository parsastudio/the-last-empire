export class TechProgressionUtility {
  public static getNextStepLevel(currentLevel: number, step = 0.1): number {
    return Number((currentLevel + step).toFixed(1));
  }

  public static getSubLevelIndex(currentLevel: number): number {
    return Math.round((currentLevel - Math.floor(currentLevel)) * 10);
  }

  public static getProgressPercent(currentLevel: number): number {
    return this.getSubLevelIndex(currentLevel) * 10;
  }
}
