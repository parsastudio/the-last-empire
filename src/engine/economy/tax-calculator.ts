import type { Nation } from "@/domain/nation/nation.schema";

export interface TaxCalculationResult {
  taxIncome: number;
  stabilityImpact: number;
}

export class TaxCalculator {
  public calculateTaxIncome(
    gdp: number,
    taxRate: number,
    corruption: number,
    adminBurdenMultiplier = 1.0,
  ): number {
    const grossIncome = gdp * (taxRate / 100);
    const corruptionLoss = grossIncome * (corruption / 100);
    const baseIncome = grossIncome - corruptionLoss;
    const adminLoss =
      adminBurdenMultiplier > 1.5
        ? baseIncome * Math.min(0.3, (adminBurdenMultiplier - 1.5) * 0.05)
        : 0;
    return Math.floor(baseIncome - adminLoss);
  }

  public evaluateTaxPolicy(nation: Nation): TaxCalculationResult {
    const income = this.calculateTaxIncome(
      nation.gdp,
      nation.taxRate,
      nation.government.corruption,
      nation.adminBurdenMultiplier,
    );

    let stabilityImpact = 0;
    if (nation.taxRate > 20) {
      stabilityImpact = -Math.floor((nation.taxRate - 20) * 0.5);
    } else if (nation.taxRate <= 10) {
      stabilityImpact = 1;
    }

    return {
      taxIncome: income,
      stabilityImpact,
    };
  }
}
