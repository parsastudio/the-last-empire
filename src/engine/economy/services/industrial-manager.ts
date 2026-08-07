import { Nation } from "@/domain/nation/nation.schema";

export interface UpgradeCostResult {
  cost: number;
  canAfford: boolean;
}

export class IndustrialLevelManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    const baseCost = Math.floor(gdp * 0.15);
    return Math.max(2000000000, baseCost);
  }

  public static evaluateUpgrade(nation: Nation): UpgradeCostResult {
    const cost = IndustrialLevelManager.getUpgradeCost(nation);
    return {
      cost,
      canAfford: nation.treasury >= cost,
    };
  }

  public static upgradeIndustrialLevel(nation: Nation): Nation {
    const { cost, canAfford } = IndustrialLevelManager.evaluateUpgrade(nation);
    if (!canAfford) {
      return nation;
    }

    return {
      ...nation,
      treasury: nation.treasury - cost,
      industrialLevel: nation.industrialLevel + 1,
    };
  }
}
