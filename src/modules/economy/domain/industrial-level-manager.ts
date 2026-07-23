import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface UpgradeCostResult {
  cost: number;
  canAfford: boolean;
}

export class IndustrialLevelManager {
  public getUpgradeCost(currentLevel: number): number {
    return Math.floor(50000 * Math.pow(1.3, currentLevel - 1));
  }

  public evaluateUpgrade(nation: Nation): UpgradeCostResult {
    const cost = this.getUpgradeCost(nation.industrialLevel);
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
