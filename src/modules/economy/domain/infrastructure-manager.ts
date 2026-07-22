import type { Nation } from "@/core/types/nation.types";

export interface InfrastructureUpgradeResult {
  cost: number;
  canAfford: boolean;
}

export class InfrastructureManager {
  public getUpgradeCost(currentLevel: number): number {
    return Math.floor(30000 * Math.pow(1.6, currentLevel - 1));
  }

  public evaluateUpgrade(nation: Nation): InfrastructureUpgradeResult {
    const cost = this.getUpgradeCost(nation.geography.infrastructureLevel);
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
