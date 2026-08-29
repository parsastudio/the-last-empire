import { Nation } from "@/domain/nation/nation.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";

export interface TechSuperiorityDelta {
  militaryDelta: number;
  industrialDelta: number;
  totalAvailablePoints: number;
}

export class EspionageCalculator {
  public static readonly TIER_1_COST_RATIO = 0.04;
  public static readonly TIER_2_COST_RATIO = 0.18;
  public static readonly TIER_3_COST_RATIO = 0.4;
  public static readonly MIN_TECH_DELTA_FOR_HEIST = 0.5;
  public static readonly TECH_HEIST_GAIN = 0.5;

  public static calculateOperationCost(
    targetGdp: number,
    tier: EspionageTier,
  ): number {
    let baseRatio = this.TIER_1_COST_RATIO;
    if (tier === 2) baseRatio = this.TIER_2_COST_RATIO;
    if (tier === 3) baseRatio = this.TIER_3_COST_RATIO;

    return Math.floor(targetGdp * baseRatio);
  }

  public static calculateTechSuperiority(
    sourceNation: Nation,
    targetNation: Nation,
  ): TechSuperiorityDelta {
    const militaryDelta = Number(
      Math.max(
        0,
        targetNation.military.techLevel - sourceNation.military.techLevel,
      ).toFixed(1),
    );

    const isEligible = militaryDelta >= this.MIN_TECH_DELTA_FOR_HEIST;
    const totalPoints = isEligible ? this.TECH_HEIST_GAIN : 0;

    return {
      militaryDelta,
      industrialDelta: 0,
      totalAvailablePoints: totalPoints,
    };
  }

  public static calculateSuccessRate(
    tier: EspionageTier,
    sourceRank = 50,
    targetRank = 50,
  ): number {
    if (tier === 1) {
      return 1.0;
    }

    const rankGap = sourceRank - targetRank;
    const rankModifier = -rankGap * 0.015;

    let baseChance = 0.5;
    let minRate = 0.2;
    let maxRate = 0.85;

    if (tier === 2) {
      baseChance = 0.6;
      minRate = 0.25;
      maxRate = 0.9;
    } else if (tier === 3) {
      baseChance = 0.45;
      minRate = 0.15;
      maxRate = 0.85;
    }

    const calculated = baseChance + rankModifier;
    return Number(Math.max(minRate, Math.min(maxRate, calculated)).toFixed(2));
  }
}
