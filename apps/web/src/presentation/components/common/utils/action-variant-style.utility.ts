export type ActionColorVariant = "gdp" | "military" | "primary" | "treasury";

export class ActionVariantStyleUtility {
  public static getButtonBg(variant: ActionColorVariant = "gdp"): string {
    switch (variant) {
      case "military":
        return "bg-military hover:bg-military/90 shadow-military/20 text-primary-foreground";
      case "primary":
        return "bg-primary hover:bg-primary/90 shadow-primary/20 text-primary-foreground";
      case "treasury":
        return "bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/20 text-primary-foreground";
      case "gdp":
      default:
        return "bg-gdp hover:bg-gdp/90 shadow-gdp/20 text-primary-foreground";
    }
  }

  public static getMaxButtonBg(variant: ActionColorVariant = "gdp"): string {
    switch (variant) {
      case "military":
        return "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-500";
      case "primary":
        return "bg-primary/20 hover:bg-primary/30 border-primary/40 text-primary";
      case "treasury":
        return "bg-treasury/20 hover:bg-treasury/30 border-treasury/40 text-treasury";
      case "gdp":
      default:
        return "bg-gdp/20 hover:bg-gdp/30 border-gdp/40 text-gdp";
    }
  }
}
