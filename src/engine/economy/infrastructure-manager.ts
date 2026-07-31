import type { Nation } from "@/domain/nation/nation.schema";

export interface InfrastructureUpgradeResult {
  cost: number;
  canAfford: boolean;
}

export class InfrastructureManager {
  public getUpgradeCost(nation: Nation): number {
    const level = Math.max(1, nation.geography.infrastructureLevel);
    const baseCost = Math.floor(nation.gdp * 0.1 * Math.pow(1.25, level - 1));
    return Math.max(1000000000, baseCost);
  }

  public evaluateUpgrade(nation: Nation): InfrastructureUpgradeResult {
    const cost = this.getUpgradeCost(nation);
    return {
      cost,
      canAfford: nation.treasury >= cost,
    };
  }

  public upgradeInfrastructure(nation: Nation): Nation {
    const { cost, canAfford } = this.evaluateUpgrade(nation);
    if (!canAfford) {
      return nation;
    }

    return {
      ...nation,
      treasury: nation.treasury - cost,
      geography: {
        ...nation.geography,
        infrastructureLevel: nation.geography.infrastructureLevel + 1,
      },
    };
  }
}
