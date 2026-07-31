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
  ): number {
    const effectiveTaxRate = Math.min(50, Math.max(0, taxRate));
    const grossIncome = gdp * (effectiveTaxRate / 100);
    const corruptionLoss = grossIncome * (corruption / 100);
    const baseIncome = grossIncome - corruptionLoss;
    return Math.floor(baseIncome);
  }

  public evaluateTaxPolicy(nation: Nation): TaxCalculationResult {
    const income = this.calculateTaxIncome(
      nation.gdp,
      nation.taxRate,
      nation.government.corruption,
    );

    const clampedRate = Math.min(50, Math.max(0, nation.taxRate));
    const stabilityImpact = Number(
      (2.0 - (clampedRate / 50) * 10.0).toFixed(2),
    );

    return {
      taxIncome: income,
      stabilityImpact,
    };
  }
}
