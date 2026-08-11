import type { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import {
  TaxCalculator,
  TariffCalculator,
} from "@/engine/economy/economy-calculators";

export class StabilityCalculator {
  public static calculateTurnStabilityDelta(nation: Nation): number {
    const taxResult = TaxCalculator.evaluateTaxPolicy(nation);
    const tariffResult = TariffCalculator.calculateTariffEffects(nation);

    let delta = taxResult.stabilityImpact + tariffResult.stabilityImpact;

    const capacity =
      nation.maxPopulationCapacity ||
      Math.floor((nation.population || 1) / 0.95);
    const capacityRatio = (nation.population || 0) / (capacity || 1);

    if (capacityRatio > 1.0) {
      delta -= Math.min(5, (capacityRatio - 1.0) * 10);
    } else if (capacityRatio < 0.9) {
      delta += 0.5;
    }

    const govTraits = GovernmentSystem.getTraits(nation.government.type);
    delta += govTraits.stabilityDeltaPerTurn;

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
}
