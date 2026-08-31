import type { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { NationRelationResolver } from "@geopolitics/domain";

export class StabilityCalculator {
  public static readonly PEACE_RECOVERY_RATE = 1.0;

  public static clampStability(stability: number): number {
    return Math.max(0, Math.min(100, Number(stability.toFixed(2))));
  }

  public static calculateTurnStabilityDelta(
    nation: Nation,
    isAtWar?: boolean,
  ): number {
    let delta = 0;
    const warActive = isAtWar ?? NationRelationResolver.isAtWar(nation);

    if (!warActive) {
      if (nation.government.stability < 85) {
        delta += this.PEACE_RECOVERY_RATE;
      }
    }

    const stabilityModifier = ModifierManager.getModifierImpact(
      nation,
      "STABILITY_DELTA",
    );
    delta += stabilityModifier;

    return Number(delta.toFixed(2));
  }

  public static calculateTurnStability(
    nation: Nation,
    isAtWar?: boolean,
  ): number {
    const delta = StabilityCalculator.calculateTurnStabilityDelta(
      nation,
      isAtWar,
    );
    return StabilityCalculator.clampStability(
      nation.government.stability + delta,
    );
  }
}
