import { Nation } from "@/domain/nation/nation.schema";

export class InfrastructureManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(1000000000, Math.floor(gdp * 0.1));
  }
}

export class IndustrialLevelManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(2000000000, Math.floor(gdp * 0.15));
  }
}
