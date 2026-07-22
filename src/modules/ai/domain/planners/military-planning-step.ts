import type { GameAction } from "@/core/types/actions.types";
import { AIRecruitmentPlanner } from "../ai-recruitment-planner";
import { AIPlanner } from "./ai-planner";
import { AIPlanningContext } from "./ai-planning-context";

export class MilitaryPlanningStep implements AIPlanner {
  private recruitmentPlanner = new AIRecruitmentPlanner();

  public plan(context: AIPlanningContext): GameAction[] {
    const needs = context.needs;
    const risk = context.risk;
    const allocation = context.budget;

    if (
      allocation.recruitmentBudget > 0 &&
      (needs.needMilitary > 0.4 || risk > 30)
    ) {
      return this.recruitmentPlanner.planRecruitment(
        context.nation,
        allocation.recruitmentBudget,
      );
    }

    return [];
  }
}
