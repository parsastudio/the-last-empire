import type { Nation } from "@/domain/nation/nation.schema";
import type { GovernmentType } from "@/domain/politics/politics.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";

export class StabilityCalculator {
  public static clampStability(stability: number): number {
    return Math.max(0, Math.min(100, Number(stability.toFixed(2))));
  }

  public static calculateAttackerBattleStabilityDelta(
    type: GovernmentType,
    isVictory: boolean,
  ): number {
    const traits = GovernmentSystem.getTraits(type);
    return isVictory
      ? traits.attackerVictoryBonus
      : -traits.attackerDefeatPenalty;
  }

  public static calculateDefenderBattleStabilityDelta(
    type: GovernmentType,
    isProvinceLost: boolean,
  ): number {
    if (!isProvinceLost) {
      return 0;
    }
    const traits = GovernmentSystem.getTraits(type);
    return -traits.defenderLossPenalty;
  }

  public static calculateTurnStabilityDelta(
    nation: Nation,
    isAtWar?: boolean,
  ): number {
    const traits = GovernmentSystem.getTraits(nation.government.type);
    let delta = 0;

    const warActive =
      isAtWar ??
      Object.values(nation.relations || {}).some((r) => r.stance === "WAR");

    if (!warActive) {
      if (nation.government.stability < 85) {
        delta += traits.peaceRecoveryRate;
      }
    }

    const rep = nation.globalReputation ?? 50;
    if (rep > 50) {
      const repBonus = ((Math.min(100, rep) - 50) / 50) * 1.5;
      delta += repBonus;
    }

    const clampedTax = Math.min(50, Math.max(0, nation.taxRate));
    const taxStabilityDelta = (15 - clampedTax) * 0.1;
    delta += taxStabilityDelta;

    const clampedTariff = Math.min(50, Math.max(0, nation.tariffRate));
    const tariffStabilityDelta = (15 - clampedTariff) * 0.1;
    delta += tariffStabilityDelta;

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
