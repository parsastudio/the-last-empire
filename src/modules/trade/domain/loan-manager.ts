import type { Nation } from "@/core/types/nation.types";

export class LoanManager {
  public calculateCreditRating(nation: Nation): number {
    const debtRatio = nation.gdp > 0 ? nation.debt / nation.gdp : 1;
    let score = 100;
    score -= Math.min(50, Math.floor(debtRatio * 40));
    score -= Math.min(30, 100 - nation.government.stability);
    return Math.max(0, score);
  }
}
