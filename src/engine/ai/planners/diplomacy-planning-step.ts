import type { GameAction } from "@/domain/game/action.schema";
import { AIDiplomacyLogic } from "@/engine/ai/ai-diplomacy-logic";
import { AIPlanner } from "@/engine/ai/planners/ai-planner";
import { AIPlanningContext } from "@/engine/ai/planners/ai-planning-context";

export class DiplomacyPlanningStep implements AIPlanner {
  private diplomacyLogic = new AIDiplomacyLogic();

  public plan(context: AIPlanningContext): GameAction[] {
    if (context.needs.needDiplomacy > 0.3) {
      return this.diplomacyLogic.planDiplomacy(
        context.nation,
        context.allNations,
        context.weights.personality,
      );
    }
    return [];
  }
}
