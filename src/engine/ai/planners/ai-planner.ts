import type { GameAction } from "@/domain/game/action.schema";
import { AIPlanningContext } from "@/engine/ai/planners/ai-planning-context";

export interface AIPlanner {
  plan(context: AIPlanningContext): GameAction[];
}
