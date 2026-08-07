import { Nation } from "@/domain/nation/nation.schema";

export interface InfrastructureUpgradeResult {
  cost: number;
  canAfford: boolean;
}

export class InfrastructureManager {
  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp = typeof gdpOrNation === "number" ? gdpOrNation : gdpOrNation.gdp;
    const baseCost = Math.floor(gdp * 0.1);
    return Math.max(1000000000, baseCost);
  }

  public static evaluateUpgrade(nation: Nation): InfrastructureUpgradeResult {
    const cost = InfrastructureManager.getUpgradeCost(nation);
    return {
      cost,
      canAfford: nation.treasury >= cost,
    };
  }

  public static upgradeInfrastructure(nation: Nation): Nation {
    const { cost, canAfford } = InfrastructureManager.evaluateUpgrade(nation);
    if (!canAfford) {
      return nation;
    }

    const newGdp = Math.floor(nation.gdp * 1.02);

    return {
      ...nation,
      treasury: nation.treasury - cost,
      gdp: newGdp,
      geography: {
        ...nation.geography,
        infrastructureLevel: nation.geography.infrastructureLevel + 1,
      },
    };
  }
}
