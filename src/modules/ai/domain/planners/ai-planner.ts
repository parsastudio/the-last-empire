import type { GameAction } from "@/core/types/actions.types";
import { AIPlanningContext } from "./ai-planning-context";

export interface AIPlanner {
  plan(context: AIPlanningContext): GameAction[];
}
