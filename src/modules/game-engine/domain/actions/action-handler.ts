import type { GameState, GameAction } from "@/core/types";

export interface ActionHandler {
  execute(state: GameState, action: GameAction): GameState;
}
