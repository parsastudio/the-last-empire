import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export interface TurnPhase {
  execute(state: GameState): GameState;
}
