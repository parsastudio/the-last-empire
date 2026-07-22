import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class InflationCalculator {
  public calculateNextInflation(nation: Nation): number {
    let delta = 0;

    if (nation.debt > 0 && nation.gdp > 0) {
      const debtRatio = nation.debt / nation.gdp;
      if (debtRatio > 0.5) {
        delta += debtRatio * 1.5;
      }
    }

    if (nation.taxRate < 5) {
      delta += 0.5;
    }

    const currentInflation = nation.inflation;
    const coolingRate = 0.2;
    const newInflation = Math.max(0, currentInflation + delta - coolingRate);

    return Number(newInflation.toFixed(2));
  }
}
