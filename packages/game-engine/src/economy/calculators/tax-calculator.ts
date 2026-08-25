import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export interface TaxCalculationResult {
  taxIncome: number;
  stabilityImpact: number;
}

export class TaxCalculator {
  public static calculateTaxIncome(gdp: number, taxRate: number): number {
    const effectiveTaxRate = Math.min(50, Math.max(0, taxRate));
    const baseIncome = gdp * (effectiveTaxRate / 100);
    return Math.floor(baseIncome);
  }

  public static evaluateTaxPolicy(
    nation: Nation,
    provincesMap?: Record<string, Province>,
  ): TaxCalculationResult {
    const income = TaxCalculator.calculateTaxIncome(
      getNationGdp(nation, provincesMap),
      nation.taxRate,
    );
    const clampedRate = Math.min(50, Math.max(0, nation.taxRate));
    const stabilityImpact = Number(((15 - clampedRate) * 0.2).toFixed(2));

    return {
      taxIncome: income,
      stabilityImpact: Number(stabilityImpact.toFixed(2)),
    };
  }
}
