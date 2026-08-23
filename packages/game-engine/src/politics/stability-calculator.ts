import type { Nation } from "@/domain/nation/nation.schema";
import type { GovernmentType } from "@/domain/politics/politics.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

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

  public static calculateDiplomaticStabilityBonus(
    proposalType: string,
    isSender: boolean,
  ): number {
    switch (proposalType) {
      case "NON_AGGRESSION_PACT":
        return 0.5;
      case "FULL_ALLIANCE":
        return 1.0;
      case "SEND_FOREIGN_AID":
        return isSender ? 0.5 : 1.0;
      default:
        return 0;
    }
  }

  public static calculateTurnStabilityDelta(
    nation: Nation,
    isAtWar?: boolean,
    isBlockaded?: boolean,
  ): number {
    const traits = GovernmentSystem.getTraits(nation.government.type);
    let delta = 0;

    const warActive =
      isAtWar ??
      Object.values(nation.relations || {}).some((r) => r.stance === "WAR");

    if (warActive) {
      if (isBlockaded) {
        delta -= traits.blockadePenalty;
      }
    } else {
      if (nation.government.stability < 85) {
        const gap = (85 - nation.government.stability) / 85;
        delta += traits.peaceRecoveryRate * gap;
      }
    }

    const clampedTax = Math.min(50, Math.max(0, nation.taxRate));
    let taxStabilityDelta = (15 - clampedTax) * 0.1;
    if (taxStabilityDelta < 0) {
      const discount = DoctrinesManager.getTaxStabilityPenaltyDiscount(
        nation.doctrines?.unlockedDoctrines,
      );
      taxStabilityDelta *= discount;
    }
    delta += taxStabilityDelta;

    const clampedTariff = Math.min(100, Math.max(0, nation.tariffRate));
    const tariffStabilityDelta = (10 - clampedTariff) * 0.04;
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
    isBlockaded?: boolean,
  ): number {
    const delta = StabilityCalculator.calculateTurnStabilityDelta(
      nation,
      isAtWar,
      isBlockaded,
    );
    return StabilityCalculator.clampStability(
      nation.government.stability + delta,
    );
  }
}
