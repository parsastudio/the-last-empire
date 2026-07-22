import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";

export interface ActionHandler {
  execute(state: GameState, action: GameAction): GameState;
}
