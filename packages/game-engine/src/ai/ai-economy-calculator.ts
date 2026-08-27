import { GovernmentType } from "@/domain/politics/politics.schema";

export class AiEconomyCalculator {
  public static getGovernmentIncomeMultiplier(
    _govType?: GovernmentType | string,
  ): number {
    return 1.0;
  }

  public static calculateIncomeRate(
    rank: number,
    totalAliveCount: number,
  ): number {
    if (totalAliveCount <= 1) {
      return 0.3;
    }

    const safeRank = Math.max(1, Math.min(totalAliveCount, rank));
    const rankProgress = (safeRank - 1) / (totalAliveCount - 1);

    return 0.3 + rankProgress * 0.3;
  }

  public static calculateTurnIncome(
    gdp: number,
    rank: number,
    totalAliveCount: number,
    govType?: GovernmentType | string,
  ): number {
    const rate = this.calculateIncomeRate(rank, totalAliveCount);
    const govMultiplier = this.getGovernmentIncomeMultiplier(govType);
    return Math.floor(gdp * rate * govMultiplier);
  }

  public static calculateMaxArmyValuation(gdp: number): number {
    return Math.max(0, Math.floor(gdp));
  }
}
