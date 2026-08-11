import { Nation } from "@/domain/nation/nation.schema";

export class InfrastructureManager {
  public static readonly CAPACITY_UPGRADE_MULTIPLIER = 1.2;

  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(1000000000, Math.floor(gdp * 0.1));
  }

  public static calculateNextCapacityOnUpgrade(
    currentCapacity: number,
  ): number {
    return Math.floor(
      currentCapacity * InfrastructureManager.CAPACITY_UPGRADE_MULTIPLIER,
    );
  }
}

export class IndustrialLevelManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(2000000000, Math.floor(gdp * 0.15));
  }
}
