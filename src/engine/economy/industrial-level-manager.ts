import type { Nation } from "@/domain/nation/nation.schema";

export interface UpgradeCostResult {
  cost: number;
  canAfford: boolean;
}

export class IndustrialLevelManager {
  public getUpgradeCost(nation: Nation): number {
    const baseCost = Math.floor(nation.gdp * 0.15);
    return Math.max(2000000000, baseCost);
  }

  public evaluateUpgrade(nation: Nation): UpgradeCostResult {
    const cost = this.getUpgradeCost(nation);
    return {
      cost,
      canAfford: nation.treasury >= cost,
    };
  }

  public upgradeIndustrialLevel(nation: Nation): Nation {
    const { cost, canAfford } = this.evaluateUpgrade(nation);
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
