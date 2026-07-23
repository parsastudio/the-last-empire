import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { NationManager } from "@/modules/nation/domain/nation-manager";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";

export class ForceLimitCalculator {
  private nationManager = new NationManager();
  private governmentSystem = new GovernmentSystem();

  public calculateForceLimit(nation: Nation): number {
    const baseLimit = Math.floor(nation.population * 0.05);
    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    return Math.max(
      10,
      Math.floor(baseLimit * govTraits.militaryPowerMultiplier),
    );
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
