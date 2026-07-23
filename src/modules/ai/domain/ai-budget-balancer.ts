import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { AIBudgetStrategy } from "./planners/ai-budget-strategy";

export interface BudgetAllocation {
  researchBudget: number;
  recruitmentBudget: number;
  infrastructureBudget: number;
  antiCorruptionBudget: number;
  reserveFunds: number;
  doctrinesBudget: number;
  proxyBudget: number;
}

export class AIBudgetBalancer {
  private budgetStrategy = new AIBudgetStrategy();

  public balanceBudget(nation: Nation, focus: string): BudgetAllocation {
    const totalFunds = Math.max(0, nation.treasury);
    let reserveRatio = 0.2;
    let researchRatio = 0.1;
    let recruitmentRatio = 0.2;
    let infraRatio = 0.2;
    let corruptionRatio = 0.1;
    let doctrinesRatio = 0.1;
    let proxyRatio = 0.1;

    if (focus === "AGGRESSIVE") {
      reserveRatio = 0.1;
      recruitmentRatio = 0.4;
      researchRatio = 0.1;
      infraRatio = 0.1;
      corruptionRatio = 0.1;
      doctrinesRatio = 0.1;
      proxyRatio = 0.1;
    } else if (focus === "ECONOMIC") {
      reserveRatio = 0.2;
      recruitmentRatio = 0.1;
      infraRatio = 0.4;
      researchRatio = 0.1;
      corruptionRatio = 0.1;
      doctrinesRatio = 0.1;
      proxyRatio = 0.0;
    }

    const baseAllocation: BudgetAllocation = {
      researchBudget: Math.floor(totalFunds * researchRatio),
      recruitmentBudget: Math.floor(totalFunds * recruitmentRatio),
      infrastructureBudget: Math.floor(totalFunds * infraRatio),
      antiCorruptionBudget: Math.floor(totalFunds * corruptionRatio),
      reserveFunds: Math.floor(totalFunds * reserveRatio),
      doctrinesBudget: Math.floor(totalFunds * doctrinesRatio),
      proxyBudget: Math.floor(totalFunds * proxyRatio),
    };

    const strategyAdjusted = this.budgetStrategy.applyTraitFocus(nation, {
      researchBudget: baseAllocation.researchBudget,
      recruitmentBudget: baseAllocation.recruitmentBudget,
      infrastructureBudget: baseAllocation.infrastructureBudget,
      antiCorruptionBudget: baseAllocation.antiCorruptionBudget,
      reserveFunds: baseAllocation.reserveFunds,
    });

    return {
      ...strategyAdjusted,
      doctrinesBudget: baseAllocation.doctrinesBudget,
      proxyBudget: baseAllocation.proxyBudget,
    };
  }
}
