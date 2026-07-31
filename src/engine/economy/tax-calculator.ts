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
    const turnTaxFactor = 0.025;
    const grossIncome = gdp * turnTaxFactor * (taxRate / 100);
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

    const stabilityImpact = Number(
      (2.0 - (nation.taxRate / 100) * 14.0).toFixed(2),
    );

    return {
      taxIncome: income,
      stabilityImpact,
    };
  }
}
