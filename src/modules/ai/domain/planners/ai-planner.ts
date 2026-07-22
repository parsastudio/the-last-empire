import type { GameAction } from "@/core/types";
import { AIPlanningContext } from "./ai-planning-context";

export interface AIPlanner {
  plan(context: AIPlanningContext): GameAction[];
}
