import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";

export interface PipelineContext {
  state: GameState;
  prng: SeededRandom;
}

export interface TurnPhase {
  execute(context: PipelineContext): GameState;
}
