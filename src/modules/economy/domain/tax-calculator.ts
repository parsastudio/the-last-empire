import type { Nation } from "@/core/types";

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
    const grossIncome = gdp * (taxRate / 100);
    const corruptionLoss = grossIncome * (corruption / 100);
    return Math.floor(grossIncome - corruptionLoss);
  }

  public evaluateTaxPolicy(nation: Nation): TaxCalculationResult {
    const income = this.calculateTaxIncome(
      nation.gdp,
      nation.taxRate,
      nation.government.corruption,
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
