import { StabilityBracketType } from "@geopolitics/domain";

export interface StabilityBracketVisual {
  badgeStyleClass: string;
  textColorClass: string;
  borderColorClass: string;
}

export class StabilityBracketVisualUtility {
  public static getVisual(type: StabilityBracketType): StabilityBracketVisual {
    switch (type) {
      case "GOLDEN_AGE":
        return {
          badgeStyleClass:
            "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          textColorClass: "text-emerald-400",
          borderColorClass: "border-emerald-500/40",
        };
      case "PROSPERITY":
        return {
          badgeStyleClass: "bg-gdp/15 text-gdp border-gdp/30",
          textColorClass: "text-gdp",
          borderColorClass: "border-gdp/40",
        };
      case "STABLE":
        return {
          badgeStyleClass:
            "bg-secondary text-muted-foreground border-border/80",
          textColorClass: "text-foreground",
          borderColorClass: "border-border/80",
        };
      case "CIVIL_UNREST":
        return {
          badgeStyleClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          textColorClass: "text-amber-400",
          borderColorClass: "border-amber-500/40",
        };
      case "SYSTEMIC_CRISIS":
      default:
        return {
          badgeStyleClass:
            "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse",
          textColorClass: "text-rose-400",
          borderColorClass: "border-rose-500/50",
        };
    }
  }
}
