export class AiEconomyCalculator {
  public static calculateIncomeRate(
    rank: number,
    totalAliveCount: number,
  ): number {
    if (totalAliveCount <= 1) {
      return 0.2;
    }

    const safeRank = Math.max(1, Math.min(totalAliveCount, rank));
    const rankProgress = (safeRank - 1) / (totalAliveCount - 1);

    return 0.2 + rankProgress * 0.3;
  }

  public static calculateTurnIncome(
    gdp: number,
    rank: number,
    totalAliveCount: number,
  ): number {
    const rate = this.calculateIncomeRate(rank, totalAliveCount);
    return Math.floor(gdp * rate);
  }

  public static calculateMaxArmyValuation(
    gdp: number,
    rank: number,
    totalAliveCount: number,
  ): number {
    const turnIncome = this.calculateTurnIncome(gdp, rank, totalAliveCount);
    return turnIncome * 10;
  }
}
