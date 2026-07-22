import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { NationManager } from "@/modules/nation/domain/nation-manager";

export class ForceLimitCalculator {
  private nationManager = new NationManager();

  public calculateForceLimit(nation: Nation): number {
    const baseLimit = Math.floor(nation.population * 0.05);

    let govMultiplier = 1.0;
    if (nation.government.type === "FASCISM") {
      govMultiplier = 1.5;
    } else if (nation.government.type === "DICTATORSHIP") {
      govMultiplier = 1.25;
    } else if (nation.government.type === "DEMOCRACY") {
      govMultiplier = 0.85;
    }

    return Math.max(10, Math.floor(baseLimit * govMultiplier));
  }

  public getTotalMilitaryCount(nation: Nation): number {
    return this.nationManager.getTotalArmyCount(nation);
  }

  public getOverForceLimitPenalty(nation: Nation): number {
    const forceLimit = this.calculateForceLimit(nation);
    const totalCount = this.getTotalMilitaryCount(nation);

    if (totalCount <= forceLimit) {
      return 1.0;
    }

    const excessRatio = (totalCount - forceLimit) / forceLimit;
    return 1.0 + excessRatio * 2.0;
  }
}
