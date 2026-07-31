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

    let stabilityImpact = 0;
    if (nation.taxRate > 25) {
      stabilityImpact = -Math.floor((nation.taxRate - 25) * 0.5);
    } else if (nation.taxRate <= 10) {
      stabilityImpact = 1;
    }

    return {
      taxIncome: income,
      stabilityImpact,
    };
  }
}
