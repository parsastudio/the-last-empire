import type { GameAction } from "@/domain/game/action.schema";
import { AIPlanningContext } from "./ai-planning-context.interface";

export interface AIPlanner {
  plan(context: AIPlanningContext): GameAction[];
}
