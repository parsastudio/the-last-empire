import { Nation } from "@/domain/nation/nation.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";

export interface TechSuperiorityDelta {
  militaryDelta: number;
  industrialDelta: number;
  totalAvailablePoints: number;
}

export class EspionageCalculator {
  public static readonly TIER_1_COST_RATIO = 0.06;
  public static readonly TIER_2_COST_RATIO = 0.18;
  public static readonly TIER_3_COST_RATIO = 0.4;

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
    const industrialDelta = Math.max(
      0,
      targetNation.industrialLevel - sourceNation.industrialLevel,
    );

    return {
      militaryDelta,
      industrialDelta,
      totalAvailablePoints: Number(
        (militaryDelta + industrialDelta).toFixed(1),
      ),
    };
  }

  public static calculateSuccessRate(
    tier: EspionageTier,
    sourceNation: Nation,
    targetNation?: Nation,
  ): number {
    let baseChance = 0.8;
    if (tier === 2) baseChance = 0.6;
    if (tier === 3) baseChance = 0.4;

    if (!targetNation) {
      return baseChance;
    }

    const sourceTech = Math.max(1.0, sourceNation.military.techLevel || 1.0);
    const targetTech = Math.max(1.0, targetNation.military.techLevel || 1.0);
    const deltaTech = sourceTech - targetTech;
    const steps = Math.round(deltaTech * 10);

    const rate = baseChance + steps * 0.02;
    return Number(Math.max(0.15, Math.min(0.85, rate)).toFixed(2));
  }
}
