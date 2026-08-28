export class AiEconomyCalculator {
  public static calculateComparativeTurnIncome(
    taxIncomeAt30: number,
    tariffRevenueAt30: number,
  ): number {
    const higherRevenue = Math.max(taxIncomeAt30, tariffRevenueAt30);
    return Math.floor(higherRevenue * 0.9);
  }

  public static calculateMaxArmyValuation(gdp: number): number {
    return Math.max(0, Math.floor(gdp));
  }
}
