import { GovernmentType } from "@/domain/politics/politics.schema";

export class AiEconomyCalculator {
  public static getGovernmentIncomeMultiplier(
    govType?: GovernmentType | string,
  ): number {
    switch (govType) {
      case "DEMOCRACY":
        return 1.1;
      case "MONARCHY":
        return 1.05;
      case "COMMUNISM":
        return 1.0;
      case "DICTATORSHIP":
        return 0.95;
      case "FASCISM":
        return 0.9;
      default:
        return 1.0;
    }
  }

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
    govType?: GovernmentType | string,
  ): number {
    const rate = this.calculateIncomeRate(rank, totalAliveCount);
    const govMultiplier = this.getGovernmentIncomeMultiplier(govType);
    return Math.floor(gdp * rate * govMultiplier);
  }

  public static calculateMaxArmyValuation(
    gdp: number,
    rank: number,
    totalAliveCount: number,
    govType?: GovernmentType | string,
  ): number {
    const turnIncome = this.calculateTurnIncome(
      gdp,
      rank,
      totalAliveCount,
      govType,
    );
    return turnIncome * 10;
  }

  public static calculateArmyMaintenanceDeductionRate(
    currentArmyValuation: number,
    maxArmyValuation: number,
  ): number {
    if (maxArmyValuation <= 0 || currentArmyValuation <= 0) {
      return 0;
    }
    const ratio = Math.min(1.0, currentArmyValuation / maxArmyValuation);
    return ratio * 0.2;
  }

  public static calculateEffectiveTurnIncome(
    gdp: number,
    rank: number,
    totalAliveCount: number,
    currentArmyValuation: number,
    govType?: GovernmentType | string,
  ): number {
    const baseIncome = this.calculateTurnIncome(
      gdp,
      rank,
      totalAliveCount,
      govType,
    );
    const maxValuation = this.calculateMaxArmyValuation(
      gdp,
      rank,
      totalAliveCount,
      govType,
    );
    const deductionRate = this.calculateArmyMaintenanceDeductionRate(
      currentArmyValuation,
      maxValuation,
    );
    return Math.floor(baseIncome * (1.0 - deductionRate));
  }
}
