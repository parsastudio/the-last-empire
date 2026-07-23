import type { GameAction } from "@/domain/game/action.schema";
import { AIDiplomacyLogic } from "../ai-diplomacy-logic";
import { AIPlanner } from "./ai-planner";
import { AIPlanningContext } from "./ai-planning-context";

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
