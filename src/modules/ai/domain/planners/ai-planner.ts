import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { AIPlanningContext } from "./ai-planning-context";

export interface AIPlanner {
  plan(context: AIPlanningContext): GameAction[];
}
