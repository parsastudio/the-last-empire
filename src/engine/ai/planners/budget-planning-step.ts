import type { GameAction } from "@/domain/game/action.schema";
import { AIPlanner } from "./ai-planner.interface";
import { AIPlanningContext } from "./ai-planning-context.interface";
import { DeterministicIdGenerator } from "../utils/deterministic-id-generator";

export class BudgetPlanningStep implements AIPlanner {
  private idGenerator = new DeterministicIdGenerator();

  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;
    const allocation = context.budget;
    const turn = context.currentTurn ?? 1;
    let seq = 1;

    if (nation.doctrines.doctrinePoints >= 3) {
      actions.push({
        id: this.idGenerator.generateActionId(
          "UNLOCK_DOCTRINE",
          nation.id,
          turn,
          seq++,
        ),
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
          id: this.idGenerator.generateActionId(
            "FUND_PROXY_INFLUENCE",
            nation.id,
            turn,
            seq++,
          ),
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
        id: this.idGenerator.generateActionId(
          "ANTI_CORRUPTION_DRIVE",
          nation.id,
          turn,
          seq++,
        ),
        nationId: nation.id,
        type: "ANTI_CORRUPTION_DRIVE",
        amount: Math.min(allocation.antiCorruptionBudget, 15000),
      });
    }

    if (allocation.infrastructureBudget > 30000) {
      actions.push({
        id: this.idGenerator.generateActionId(
          "INVEST_INFRASTRUCTURE",
          nation.id,
          turn,
          seq++,
        ),
        nationId: nation.id,
        type: "INVEST_INFRASTRUCTURE",
      });
    }

    if (allocation.researchBudget > 100000) {
      actions.push({
        id: this.idGenerator.generateActionId(
          "INVEST_RESEARCH",
          nation.id,
          turn,
          seq++,
        ),
        nationId: nation.id,
        type: "INVEST_RESEARCH",
      });
    }

    return actions;
  }
}
