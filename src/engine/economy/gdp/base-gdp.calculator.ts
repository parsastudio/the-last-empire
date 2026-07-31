export class BaseGdpCalculator {
  public calculateBaseGdp(
    population: number,
    infrastructureLevel: number,
  ): number {
    const basePerCapita = 10;
    const infraBonus = 1 + infrastructureLevel * 0.05;
    return Math.floor(population * basePerCapita * infraBonus);
  }
}
