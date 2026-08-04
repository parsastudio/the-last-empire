import type { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface TaxCalculationResult {
  taxIncome: number;
  stabilityImpact: number;
}

export class TaxCalculator {
  public static calculateTaxIncome(
    gdp: number,
    taxRate: number,
    corruption: number,
    unlockedDoctrines?: string[],
  ): number {
    const effectiveTaxRate = Math.min(50, Math.max(0, taxRate));
    const grossIncome = gdp * (effectiveTaxRate / 100);
    const corruptionLoss = grossIncome * (corruption / 100);
    const baseIncome = grossIncome - corruptionLoss;

    const researchMultiplier =
      DoctrinesManager.getGdpTaxRevenueMultiplier(unlockedDoctrines);

    return Math.floor(baseIncome * researchMultiplier);
  }

  public static evaluateTaxPolicy(nation: Nation): TaxCalculationResult {
    const income = TaxCalculator.calculateTaxIncome(
      nation.gdp,
      nation.taxRate,
      nation.government.corruption,
      nation.doctrines.unlockedDoctrines,
    );

    const clampedRate = Math.min(50, Math.max(0, nation.taxRate));
    let stabilityImpact = Number(((15 - clampedRate) * 0.2).toFixed(2));

    if (stabilityImpact < 0) {
      const discount = DoctrinesManager.getTaxStabilityPenaltyDiscount(
        nation.doctrines.unlockedDoctrines,
      );
      stabilityImpact *= discount;
    }

    return {
      taxIncome: income,
      stabilityImpact: Number(stabilityImpact.toFixed(2)),
    };
  }
}
