export class ProxyWarManager {
  public static calculateBudget(
    targetGdp: number,
    desiredDrainPercent: number,
  ): number {
    if (targetGdp <= 0 || desiredDrainPercent <= 0) return 0;
    return Math.floor(targetGdp * (desiredDrainPercent / 2) * 0.01);
  }
}
