import type { GameState } from "@/core/types/game-state.types";

export interface TurnPhase {
  execute(state: GameState): GameState;
}
