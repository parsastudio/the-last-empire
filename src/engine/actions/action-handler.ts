import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";

export interface ActionHandler {
  execute(state: GameState, action: GameAction): GameState;
}
