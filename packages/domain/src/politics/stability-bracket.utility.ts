export type StabilityBracketType =
  | "GOLDEN_AGE"
  | "PROSPERITY"
  | "STABLE"
  | "CIVIL_UNREST"
  | "SYSTEMIC_CRISIS";

export interface StabilityBracketInfo {
  type: StabilityBracketType;
  min: number;
  max: number;
  revenueMultiplier: number;
}

export class StabilityBracketUtility {
  public static readonly BRACKETS: Record<
    StabilityBracketType,
    StabilityBracketInfo
  > = {
    GOLDEN_AGE: {
      type: "GOLDEN_AGE",
      min: 90,
      max: 100,
      revenueMultiplier: 1.1,
    },
    PROSPERITY: {
      type: "PROSPERITY",
      min: 75,
      max: 89,
      revenueMultiplier: 1.05,
    },
    STABLE: {
      type: "STABLE",
      min: 45,
      max: 74,
      revenueMultiplier: 1.0,
    },
    CIVIL_UNREST: {
      type: "CIVIL_UNREST",
      min: 25,
      max: 44,
      revenueMultiplier: 0.88,
    },
    SYSTEMIC_CRISIS: {
      type: "SYSTEMIC_CRISIS",
      min: 0,
      max: 24,
      revenueMultiplier: 0.7,
    },
  };

  public static getBracket(stability: number): StabilityBracketInfo {
    const safeStability = Math.max(0, Math.min(100, Math.round(stability)));

    if (safeStability >= 90) return this.BRACKETS.GOLDEN_AGE;
    if (safeStability >= 75) return this.BRACKETS.PROSPERITY;
    if (safeStability >= 45) return this.BRACKETS.STABLE;
    if (safeStability >= 25) return this.BRACKETS.CIVIL_UNREST;
    return this.BRACKETS.SYSTEMIC_CRISIS;
  }

  public static getRevenueMultiplier(stability: number): number {
    return this.getBracket(stability).revenueMultiplier;
  }
}
