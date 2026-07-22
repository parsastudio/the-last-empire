import type { Nation } from "@/core/types";

export interface BudgetAllocation {
  researchBudget: number;
  recruitmentBudget: number;
  infrastructureBudget: number;
  antiCorruptionBudget: number;
  reserveFunds: number;
}

export class AIBudgetBalancer {
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

    return {
      researchBudget: Math.floor(totalFunds * researchRatio),
      recruitmentBudget: Math.floor(totalFunds * recruitmentRatio),
      infrastructureBudget: Math.floor(totalFunds * infraRatio),
      antiCorruptionBudget: Math.floor(totalFunds * corruptionRatio),
      reserveFunds: Math.floor(totalFunds * reserveRatio),
    };
  }
}
