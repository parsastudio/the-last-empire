import type { GameState } from "@/core/types/game-state.types";
import type { GameAction } from "@/core/types/actions.types";

export interface ActionHandler {
  execute(state: GameState, action: GameAction): GameState;
}
