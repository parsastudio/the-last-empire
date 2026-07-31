import type { Nation } from "@/domain/nation/nation.schema";

export interface UpgradeCostResult {
  cost: number;
  canAfford: boolean;
}

export class IndustrialLevelManager {
  public getUpgradeCost(nation: Nation): number {
    const level = Math.max(1, nation.industrialLevel);
    const baseCost = Math.floor(nation.gdp * 0.08 * Math.pow(1.25, level - 1));
    return Math.max(1000000000, baseCost);
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
