import type { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";

export class StabilityCalculator {
  private governmentSystem = new GovernmentSystem();
  private modifierManager = new ModifierManager();
  private taxCalc = new TaxCalculator();
  private tariffCalc = new TariffCalculator();

  public calculateTurnStability(nation: Nation): number {
    const isMartialLawActive = nation.activeModifiers.some(
      (m) => m.id === "martial-law-active",
    );
    const currentStability = nation.government.stability;

    const taxResult = this.taxCalc.evaluateTaxPolicy(nation);
    const tariffResult = this.tariffCalc.calculateTariffEffects(nation);

    let delta = taxResult.stabilityImpact + tariffResult.stabilityImpact;

    const stabilityModifier = this.modifierManager.getModifierImpact(
      nation,
      "STABILITY_DELTA",
    );
    delta += stabilityModifier;

    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    const targetStability = govTraits.baseStability;
    const alignmentFactor = (targetStability - currentStability) * 0.05;
    const newStability = Math.max(
      0,
      Math.min(100, currentStability + delta + alignmentFactor),
    );

    if (isMartialLawActive && newStability < currentStability) {
      return Math.floor((currentStability + newStability) / 2);
    }

    return Math.floor(newStability);
  }

  public getTaxIncomePenaltyMultiplier(stability: number): number {
    if (stability >= 30) {
      return 1.0;
    }
    const penalty = (30 - stability) * 0.02;
    return Math.max(0.2, 1.0 - penalty);
  }
}
