import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";

export interface PipelineContext {
  state: GameState;
  prng: SeededRandom;
}

export interface TurnPhase {
  execute(context: PipelineContext): GameState;
}
