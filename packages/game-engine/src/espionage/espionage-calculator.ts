import { Nation } from "@/domain/nation/nation.schema";
import { EspionageTier } from "@/domain/espionage/espionage.schema";

export type TechHeistMode =
  | "DUAL"
  | "MILITARY_ONLY"
  | "INDUSTRIAL_ONLY"
  | "NONE";

export interface TechSuperiorityDelta {
  militaryDelta: number;
  industrialDelta: number;
  militaryGain: number;
  industrialGain: number;
  totalAvailablePoints: number;
  heistMode: TechHeistMode;
}

export class EspionageCalculator {
  public static readonly TIER_1_COST_RATIO = 0.04;
  public static readonly TIER_2_COST_RATIO = 0.18;
  public static readonly TIER_3_COST_RATIO = 0.4;
  public static readonly MIN_TECH_DELTA_FOR_HEIST = 0.5;

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

    const industrialDelta = Number(
      Math.max(
        0,
        targetNation.industrialLevel - sourceNation.industrialLevel,
      ).toFixed(1),
    );

    const isMilSuperior = militaryDelta >= this.MIN_TECH_DELTA_FOR_HEIST;
    const isIndSuperior = industrialDelta >= this.MIN_TECH_DELTA_FOR_HEIST;

    let militaryGain = 0;
    let industrialGain = 0;
    let heistMode: TechHeistMode = "NONE";

    if (isMilSuperior && isIndSuperior) {
      militaryGain = Math.min(0.5, militaryDelta);
      industrialGain = Math.min(0.5, industrialDelta);
      heistMode = "DUAL";
    } else if (isMilSuperior) {
      militaryGain = Math.min(1.0, militaryDelta);
      industrialGain = 0;
      heistMode = "MILITARY_ONLY";
    } else if (isIndSuperior) {
      militaryGain = 0;
      industrialGain = Math.min(1.0, industrialDelta);
      heistMode = "INDUSTRIAL_ONLY";
    }

    const totalAvailablePoints = Number(
      (militaryGain + industrialGain).toFixed(1),
    );

    return {
      militaryDelta,
      industrialDelta,
      militaryGain,
      industrialGain,
      totalAvailablePoints,
      heistMode,
    };
  }

  public static calculateSuccessRate(
    tier: EspionageTier,
    sourceNation?: Nation | null,
    targetNation?: Nation | null,
  ): number {
    if (tier === 1) {
      return 1.0;
    }

    const srcMil = sourceNation?.military.techLevel ?? 1.0;
    const trgMil = targetNation?.military.techLevel ?? 1.0;
    const srcInd = sourceNation?.industrialLevel ?? 1.0;
    const trgInd = targetNation?.industrialLevel ?? 1.0;

    const milDelta = srcMil - trgMil;
    const indDelta = srcInd - trgInd;

    const milFactor = Math.pow(2.0, milDelta);
    const indFactor = Math.pow(1.5, indDelta);
    const cyberPowerRatio = (milFactor + indFactor) / 2;

    if (tier === 2) {
      const calculatedChance = 0.6 * cyberPowerRatio;
      return Number(Math.max(0.2, Math.min(0.9, calculatedChance)).toFixed(2));
    }

    const calculatedChance = 0.45 * cyberPowerRatio;
    return Number(Math.max(0.15, Math.min(0.85, calculatedChance)).toFixed(2));
  }
}
