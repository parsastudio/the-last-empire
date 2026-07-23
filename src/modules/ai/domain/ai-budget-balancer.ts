import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { AIBudgetStrategy } from "./planners/ai-budget-strategy";

export interface BudgetAllocation {
  researchBudget: number;
  recruitmentBudget: number;
  infrastructureBudget: number;
  antiCorruptionBudget: number;
  reserveFunds: number;
}

export class AIBudgetBalancer {
  private budgetStrategy = new AIBudgetStrategy();

  public balanceBudget(nation: Nation, focus: string): BudgetAllocation {
    const totalFunds = Math.max(0, nation.treasury);
    let reserveRatio = 0.3;
    let researchRatio = 0.15;
    let recruitmentRatio = 0.25;
    let infraRatio = 0.2;
    let corruptionRatio = 0.1;
    if (focus === "AGGRESSIVE") {
      reserveRatio = 0.15;
      recruitmentRatio = 0.5;
      researchRatio = 0.15;
      infraRatio = 0.1;
      corruptionRatio = 0.1;
    } else if (focus === "ECONOMIC") {
      reserveRatio = 0.25;
      recruitmentRatio = 0.1;
      infraRatio = 0.45;
      researchRatio = 0.1;
      corruptionRatio = 0.1;
    } else if (focus === "PACIFIST") {
      reserveRatio = 0.4;
      recruitmentRatio = 0.15;
      infraRatio = 0.25;
      researchRatio = 0.1;
      corruptionRatio = 0.1;
    }
    const baseAllocation: BudgetAllocation = {
      researchBudget: Math.floor(totalFunds * researchRatio),
      recruitmentBudget: Math.floor(totalFunds * recruitmentRatio),
      infrastructureBudget: Math.floor(totalFunds * infraRatio),
      antiCorruptionBudget: Math.floor(totalFunds * corruptionRatio),
      reserveFunds: Math.floor(totalFunds * reserveRatio),
    };

    if (nation.adminBurdenMultiplier > 1.8) {
      const shift = Math.floor(baseAllocation.reserveFunds * 0.3);
      baseAllocation.antiCorruptionBudget += shift;
      baseAllocation.reserveFunds -= shift;
    }

    return this.budgetStrategy.applyTraitFocus(nation, baseAllocation);
  }
}
