import type { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import {
  TaxCalculator,
  TariffCalculator,
} from "@/engine/economy/economy-calculators";
import { TraitManager } from "@/engine/politics/trait-manager";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

export class StabilityCalculator {
  public static calculateTurnStabilityDelta(nation: Nation): number {
    const taxResult = TaxCalculator.evaluateTaxPolicy(nation);
    const tariffResult = TariffCalculator.calculateTariffEffects(nation);

    let delta = taxResult.stabilityImpact + tariffResult.stabilityImpact;

    const welfareMetrics =
      PopulationWelfareCalculator.evaluateWelfareForNation(nation);
    delta += welfareMetrics.totalStabilityImpact;

    const govTraits = GovernmentSystem.getTraits(nation.government.type);
    delta += govTraits.stabilityDeltaPerTurn;

    delta += TraitManager.getStabilityDeltaPerTurn(nation);

    const stabilityModifier = ModifierManager.getModifierImpact(
      nation,
      "STABILITY_DELTA",
    );
    delta += stabilityModifier;

    return Number(delta.toFixed(2));
  }

  public static calculateTurnStability(nation: Nation): number {
    const delta = StabilityCalculator.calculateTurnStabilityDelta(nation);
    const currentStability = nation.government.stability;
    const newStability = Math.max(0, Math.min(100, currentStability + delta));

    return Number(newStability.toFixed(2));
  }

  public static getTaxIncomePenaltyMultiplier(stability: number): number {
    if (stability >= 30) {
      return 1.0;
    }
    const penalty = (30 - stability) * 0.02;
    return Math.max(0.2, 1.0 - penalty);
  }
}
