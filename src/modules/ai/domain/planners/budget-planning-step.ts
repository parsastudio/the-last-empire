import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { AIPlanner } from "./ai-planner";
import { AIPlanningContext } from "./ai-planning-context";

export class BudgetPlanningStep implements AIPlanner {
  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;
    const allocation = context.budget;

    if (
      nation.government.corruption > 35 &&
      allocation.antiCorruptionBudget > 10000
    ) {
      actions.push({
        id: `ai-anti-corruption-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nationId: nation.id,
        type: "SET_TAX_RATE",
        newRate: Math.max(10, nation.taxRate - 2),
      });
    }

    return actions;
  }
}
