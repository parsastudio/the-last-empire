import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { GovernmentSystem } from "./government-system";

export class StabilityCalculator {
  private governmentSystem = new GovernmentSystem();

  public calculateTurnStability(nation: Nation): number {
    const isMartialLawActive = nation.activeModifiers.some(
      (m) => m.id === "martial-law-active",
    );
    const currentStability = nation.government.stability;

    let delta = 0;
    if (nation.taxRate > 25) {
      delta -= (nation.taxRate - 25) * 0.5;
    } else if (nation.taxRate < 15) {
      delta += (15 - nation.taxRate) * 0.4;
    }

    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    const targetStability = govTraits.baseStability;
    const alignmentFactor = (targetStability - currentStability) * 0.05;
    const newStability = Math.max(
      0,
      Math.min(100, currentStability + delta + alignmentFactor),
    );

    if (isMartialLawActive && newStability < currentStability) {
      if (nation.taxRate > 30) {
        return Math.floor(
          Math.max(0, currentStability - (nation.taxRate - 30) * 0.5),
        );
      }
      return currentStability;
    }

    return Math.floor(newStability);
  }

  public getTaxIncomePenaltyMultiplier(stability: number): number {
    if (stability >= 30) {
      return 1.0;
    }
    const penalty = (30 - stability) * 0.02;
    return Math.max(0.2, 1.0 - penalty);
  }
}
