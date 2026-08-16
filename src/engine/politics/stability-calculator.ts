import type { Nation } from "@/domain/nation/nation.schema";
import type { GovernmentType } from "@/domain/politics/politics.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

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
        return 2.0;
      case "FULL_ALLIANCE":
        return 4.0;
      case "SEND_FOREIGN_AID":
        return isSender ? 2.0 : 4.0;
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
      const gdp = getNationGdp(nation);
      const minReserve = Math.floor(gdp * 0.02);

      if (nation.treasury < minReserve) {
        delta -= 0.5;
      } else if (nation.government.stability < 85) {
        delta += traits.peaceRecoveryRate;
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
