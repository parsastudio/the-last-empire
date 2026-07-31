import type { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";
import { TraitManager } from "@/engine/politics/trait-manager";

export class StabilityCalculator {
  private governmentSystem = new GovernmentSystem();
  private traitManager = new TraitManager();
  private modifierManager = new ModifierManager();
  private taxCalc = new TaxCalculator();
  private tariffCalc = new TariffCalculator();

  public calculateTurnStabilityDelta(nation: Nation): number {
    const taxResult = this.taxCalc.evaluateTaxPolicy(nation);
    const tariffResult = this.tariffCalc.calculateTariffEffects(nation);

    let delta = taxResult.stabilityImpact + tariffResult.stabilityImpact;

    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    delta += govTraits.stabilityDeltaPerTurn;

    delta += this.traitManager.getStabilityDeltaPerTurn(nation);

    const stabilityModifier = this.modifierManager.getModifierImpact(
      nation,
      "STABILITY_DELTA",
    );
    delta += stabilityModifier;

    return Number(delta.toFixed(2));
  }

  public calculateTurnStability(nation: Nation): number {
    const delta = this.calculateTurnStabilityDelta(nation);
    const currentStability = nation.government.stability;
    const newStability = Math.max(0, Math.min(100, currentStability + delta));

    return Number(newStability.toFixed(2));
  }

  public getTaxIncomePenaltyMultiplier(stability: number): number {
    if (stability >= 30) {
      return 1.0;
    }
    const penalty = (30 - stability) * 0.02;
    return Math.max(0.2, 1.0 - penalty);
  }
}
