import type { Nation } from "@/domain/nation/nation.schema";
import type { BudgetAllocation } from "@/engine/ai/ai-budget-balancer";

export class AIBudgetStrategy {
  public applyTraitFocus(
    nation: Nation,
    baseAllocation: BudgetAllocation,
  ): BudgetAllocation {
    const adjusted = { ...baseAllocation };
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
