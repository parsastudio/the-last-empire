export interface ForecastProbabilityStyle {
  textColorClass: string;
  bgClass: string;
}

export class AttackForecastVisualUtility {
  public static resolveProbabilityStyle(
    winProbability: number,
  ): ForecastProbabilityStyle {
    if (winProbability >= 100) {
      return {
        textColorClass: "text-gdp",
        bgClass: "bg-gdp/15 border-gdp/30",
      };
    }
    if (winProbability > 0) {
      return {
        textColorClass: "text-treasury",
        bgClass: "bg-treasury/15 border-treasury/30",
      };
    }
    return {
      textColorClass: "text-military",
      bgClass: "bg-military/15 border-military/30",
    };
  }
}
