import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export interface TaxCalculationResult {
  taxIncome: number;
  stabilityImpact: number;
}

export class TaxCalculator {
  public static calculateTaxIncome(
    gdp: number,
    taxRate: number,
    unlockedDoctrines?: string[],
  ): number {
    const effectiveTaxRate = Math.min(50, Math.max(0, taxRate));
    const baseIncome = gdp * (effectiveTaxRate / 100);
    const researchMultiplier =
      DoctrinesManager.getGdpTaxRevenueMultiplier(unlockedDoctrines);
    return Math.floor(baseIncome * researchMultiplier);
  }

  public static evaluateTaxPolicy(
    nation: Nation,
    provincesMap?: Record<string, Province>,
  ): TaxCalculationResult {
    const income = TaxCalculator.calculateTaxIncome(
      getNationGdp(nation, provincesMap),
      nation.taxRate,
      nation.doctrines?.unlockedDoctrines,
    );
    const clampedRate = Math.min(50, Math.max(0, nation.taxRate));
    let stabilityImpact = Number(((15 - clampedRate) * 0.2).toFixed(2));
    if (stabilityImpact < 0) {
      const discount = DoctrinesManager.getTaxStabilityPenaltyDiscount(
        nation.doctrines?.unlockedDoctrines,
      );
      stabilityImpact *= discount;
    }
    return {
      taxIncome: income,
      stabilityImpact: Number(stabilityImpact.toFixed(2)),
    };
  }
}
