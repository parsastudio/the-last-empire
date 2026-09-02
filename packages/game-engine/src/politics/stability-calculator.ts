import type { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { NationRelationResolver } from "@geopolitics/domain";

export class StabilityCalculator {
  public static readonly PEACE_RECOVERY_RATE = 1.0;
  public static readonly WAR_FATIGUE_PER_ENEMY = 1.0;
  public static readonly PRESTIGE_BOOST_RATE = 0.5;
  public static readonly ISOLATION_PENALTY_RATE = 1.0;

  public static clampStability(stability: number): number {
    return Math.max(0, Math.min(100, Number(stability.toFixed(2))));
  }

  public static calculateTurnStabilityDelta(
    nation: Nation,
    isAtWar?: boolean,
    allNations?: Record<string, Nation>,
  ): number {
    let delta = 0;

    const warActive =
      isAtWar ?? NationRelationResolver.isAtWar(nation, allNations);

    if (!warActive) {
      if (nation.government.stability < 85) {
        delta += this.PEACE_RECOVERY_RATE;
      }
    } else {
      const activeWarsCount = allNations
        ? NationRelationResolver.countActiveWars(nation, allNations)
        : 1;
      delta -= Math.max(1, activeWarsCount) * this.WAR_FATIGUE_PER_ENEMY;
    }

    const reputation = nation.globalReputation ?? 0;
    if (reputation >= 30) {
      delta += this.PRESTIGE_BOOST_RATE;
    } else if (reputation <= -30) {
      delta -= this.ISOLATION_PENALTY_RATE;
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
    allNations?: Record<string, Nation>,
  ): number {
    const delta = StabilityCalculator.calculateTurnStabilityDelta(
      nation,
      isAtWar,
      allNations,
    );
    return StabilityCalculator.clampStability(
      nation.government.stability + delta,
    );
  }
}
