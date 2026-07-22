import type { GameState } from "@/core/types";

export interface TurnPhase {
  execute(state: GameState): GameState;
}
