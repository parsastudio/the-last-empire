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
  labelFa: string;
  rateTextFa: string;
  badgeStyleClass: string;
  textColorClass: string;
  borderColorClass: string;
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
      labelFa: "عصر طلایی (اوج قدرت و شکوفایی)",
      rateTextFa: "+۱۰٪ درآمد ناخالص کل کشور",
      badgeStyleClass:
        "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      textColorClass: "text-emerald-400",
      borderColorClass: "border-emerald-500/40",
    },
    PROSPERITY: {
      type: "PROSPERITY",
      min: 75,
      max: 89,
      revenueMultiplier: 1.05,
      labelFa: "امنیت و رونق اقتصادی",
      rateTextFa: "+۵٪ درآمد ناخالص کل کشور",
      badgeStyleClass: "bg-gdp/15 text-gdp border-gdp/30",
      textColorClass: "text-gdp",
      borderColorClass: "border-gdp/40",
    },
    STABLE: {
      type: "STABLE",
      min: 45,
      max: 74,
      revenueMultiplier: 1.0,
      labelFa: "اوضاع آرام و پایدار",
      rateTextFa: "۰٪ (بدون تغییر درآمد)",
      badgeStyleClass: "bg-secondary text-muted-foreground border-border/80",
      textColorClass: "text-foreground",
      borderColorClass: "border-border/80",
    },
    CIVIL_UNREST: {
      type: "CIVIL_UNREST",
      min: 25,
      max: 44,
      revenueMultiplier: 0.88,
      labelFa: "اعتراضات خیابانی و رکود",
      rateTextFa: "-۱۲٪ افت عواید کل کشور",
      badgeStyleClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      textColorClass: "text-amber-400",
      borderColorClass: "border-amber-500/40",
    },
    SYSTEMIC_CRISIS: {
      type: "SYSTEMIC_CRISIS",
      min: 0,
      max: 24,
      revenueMultiplier: 0.7,
      labelFa: "شورش سراسری و خطر سقوط دولت",
      rateTextFa: "-۳۰٪ افت شدید درآمد کشور",
      badgeStyleClass:
        "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse",
      textColorClass: "text-rose-400",
      borderColorClass: "border-rose-500/50",
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
