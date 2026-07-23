import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { AIPlanner } from "./ai-planner";
import { AIPlanningContext } from "./ai-planning-context";

export class BudgetPlanningStep implements AIPlanner {
  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;
    const allocation = context.budget;

    if (nation.doctrines.doctrinePoints >= 3) {
      actions.push({
        id: `ai-unlock-doctrine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nationId: nation.id,
        type: "UNLOCK_DOCTRINE",
        doctrineId: "gdp-booster",
      });
    }

    if (allocation.proxyBudget > 15000) {
      const rivals = Object.keys(context.allNations).filter(
        (id) => id !== nation.id,
      );
      const targetRival = rivals[0];
      if (targetRival) {
        actions.push({
          id: `ai-fund-proxy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "FUND_PROXY_INFLUENCE",
          targetNationId: targetRival,
          budget: 15000,
        });
      }
    }

    if (
      nation.government.corruption > 35 &&
      allocation.antiCorruptionBudget > 10000
    ) {
      actions.push({
        id: `ai-anti-corruption-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nationId: nation.id,
        type: "ANTI_CORRUPTION_DRIVE",
        amount: Math.min(allocation.antiCorruptionBudget, 15000),
      });
    }

    if (allocation.infrastructureBudget > 30000) {
      actions.push({
        id: `ai-upgrade-infra-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nationId: nation.id,
        type: "INVEST_INFRASTRUCTURE",
      });
    }

    if (allocation.researchBudget > 100000) {
      actions.push({
        id: `ai-research-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nationId: nation.id,
        type: "INVEST_RESEARCH",
      });
    }

    return actions;
  }
}
