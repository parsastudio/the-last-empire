export class GdpCalculator {
  public static calculateProductivityOnUpgrade(
    currentProductivity: number,
  ): number {
    const prod = currentProductivity || 5000;
    return Math.max(100, Math.floor(prod * 1.05));
  }
}
