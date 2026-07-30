import type { GameAction } from "@/domain/game/action.schema";
import { AIRecruitmentPlanner } from "@/engine/ai/ai-recruitment-planner";
import { AIPlanner } from "./ai-planner.interface";
import { AIPlanningContext } from "./ai-planning-context.interface";

export class MilitaryPlanningStep implements AIPlanner {
  private recruitmentPlanner = new AIRecruitmentPlanner();

  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;
    const needs = context.needs;
    const risk = context.risk;
    const allocation = context.budget;
    const turn = context.currentTurn ?? 1;

    if (
      allocation.recruitmentBudget > 0 &&
      (needs.needMilitary > 0.4 || risk > 30)
    ) {
      actions.push(
        ...this.recruitmentPlanner.planRecruitment(
          nation,
          allocation.recruitmentBudget,
          turn,
        ),
      );
    }

    return actions;
  }
}
