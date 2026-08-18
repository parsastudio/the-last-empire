import { Nation } from "@/domain/nation/nation.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface TechSuperiorityDelta {
  militaryDelta: number;
  industrialDelta: number;
  infrastructureDelta: number;
  totalAvailablePoints: number;
}

export class EspionageCalculator {
  public static readonly TIER_1_COST_RATIO = 0.06;
  public static readonly TIER_2_COST_RATIO = 0.18;
  public static readonly TIER_3_COST_RATIO = 0.4;

  public static calculateOperationCost(
    targetGdp: number,
    tier: EspionageTier,
    sourceNation: Nation,
  ): number {
    let baseRatio = this.TIER_1_COST_RATIO;
    if (tier === 2) baseRatio = this.TIER_2_COST_RATIO;
    if (tier === 3) baseRatio = this.TIER_3_COST_RATIO;

    const baseCost = Math.floor(targetGdp * baseRatio);
    const industrialDiscount = Math.max(
      0.7,
      1.0 - (sourceNation.industrialLevel - 1) * 0.05,
    );
    const doctrineDiscount = DoctrinesManager.getProxyCostDiscount(
      sourceNation.doctrines?.unlockedDoctrines,
    );

    return Math.max(
      1000000000,
      Math.floor(baseCost * industrialDiscount * doctrineDiscount),
    );
  }

  public static calculateTechSuperiority(
    sourceNation: Nation,
    targetNation: Nation,
  ): TechSuperiorityDelta {
    const militaryDelta = Math.max(
      0,
      targetNation.military.techLevel - sourceNation.military.techLevel,
    );
    const industrialDelta = Math.max(
      0,
      targetNation.industrialLevel - sourceNation.industrialLevel,
    );
    const infrastructureDelta = Math.max(
      0,
      targetNation.geography.infrastructureLevel -
        sourceNation.geography.infrastructureLevel,
    );

    return {
      militaryDelta,
      industrialDelta,
      infrastructureDelta,
      totalAvailablePoints:
        militaryDelta + industrialDelta + infrastructureDelta,
    };
  }

  public static calculateSuccessRate(
    tier: EspionageTier,
    sourceNation: Nation,
  ): number {
    let baseChance = 0.8;
    if (tier === 2) baseChance = 0.6;
    if (tier === 3) baseChance = 0.4;

    const indBonus = (sourceNation.industrialLevel - 1) * 0.03;
    return Math.min(0.95, baseChance + indBonus);
  }
}
