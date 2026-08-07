import { Nation } from "@/domain/nation/nation.schema";

export class InfrastructureManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(1000000000, Math.floor(gdp * 0.1));
  }

  public static upgradeInfrastructure(nation: Nation): Nation {
    const cost = InfrastructureManager.getUpgradeCost(nation);
    if (nation.treasury < cost) return nation;
    return {
      ...nation,
      treasury: nation.treasury - cost,
      gdp: Math.floor(nation.gdp * 1.02),
      geography: {
        ...nation.geography,
        infrastructureLevel: nation.geography.infrastructureLevel + 1,
      },
    };
  }
}

export class IndustrialLevelManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    return Math.max(2000000000, Math.floor(gdp * 0.15));
  }

  public static upgradeIndustrialLevel(nation: Nation): Nation {
    const cost = IndustrialLevelManager.getUpgradeCost(nation);
    if (nation.treasury < cost) return nation;
    return {
      ...nation,
      treasury: nation.treasury - cost,
      industrialLevel: nation.industrialLevel + 1,
    };
  }
}
