import { Nation } from "@/domain/nation/nation.schema";

export class BankruptcyEvaluator {
  private readonly debtToGdpLimitRatio = 2.5;

  public hasReachedDebtLimit(nation: Nation): boolean {
    if (
      nation.activeModifiers.some((m) => m.id === "bankruptcy-debt-holiday")
    ) {
      return false;
    }
    if (nation.gdp <= 0) {
      return nation.nationalDebt > 0;
    }
    return nation.nationalDebt / nation.gdp >= this.debtToGdpLimitRatio;
  }
}
