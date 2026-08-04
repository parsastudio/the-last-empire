import type { Nation } from "@/domain/nation/nation.schema";

export class LoanManager {
  public static calculateCreditRating(nation: Nation): number {
    const debtRatio = nation.gdp > 0 ? nation.nationalDebt / nation.gdp : 1;
    let score = 100;
    score -= Math.min(100, Math.floor(debtRatio * 100));
    score -= Math.min(30, 100 - nation.government.stability);

    const badCredit = nation.activeModifiers.find(
      (m) => m.id === "bankruptcy-bad-credit",
    );
    if (badCredit) {
      score = Math.floor(score * 0.2);
    }

    return Math.max(0, score);
  }
}
