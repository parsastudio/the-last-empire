export class HomelandMilitiaCalculator {
  public calculateMilitiaGarrisonPower(
    population: number,
    stability: number,
  ): number {
    if (population <= 0) return 0;
    const baseMilitia = Math.floor(population / 100000);
    const stabilityFactor = Math.max(0.1, stability / 100);
    return Math.floor(baseMilitia * stabilityFactor * 0.5);
  }
}
