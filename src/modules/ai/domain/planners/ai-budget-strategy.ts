import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { BudgetAllocation } from "../ai-budget-balancer";

export class AIBudgetStrategy {
  public applyTraitFocus(
    nation: Nation,
    baseAllocation: BudgetAllocation,
  ): BudgetAllocation {
    const adjusted = { ...baseAllocation };
    if (nation.traits.includes("INDUSTRIAL_HUB")) {
      const extraInfra = Math.floor(adjusted.reserveFunds * 0.4);
      adjusted.infrastructureBudget += extraInfra;
      adjusted.reserveFunds -= extraInfra;
      const extraResearch = Math.floor(adjusted.reserveFunds * 0.2);
      adjusted.researchBudget += extraResearch;
      adjusted.reserveFunds -= extraResearch;
    }
    if (nation.traits.includes("MILITARISTIC")) {
      const extraMilitary = Math.floor(adjusted.reserveFunds * 0.5);
      adjusted.recruitmentBudget += extraMilitary;
      adjusted.reserveFunds -= extraMilitary;
    }
    if (nation.traits.includes("OIL_RICH")) {
      const extraReserve = Math.floor(adjusted.infrastructureBudget * 0.1);
      adjusted.reserveFunds += extraReserve;
      adjusted.infrastructureBudget -= extraReserve;
    }
    return adjusted;
  }
}
