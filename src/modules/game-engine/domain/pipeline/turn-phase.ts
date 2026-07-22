import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { SeededRandom } from "@/core/math/seeded-random";

export interface PipelineContext {
  state: GameState;
  prng: SeededRandom;
}

export interface TurnPhase {
  execute(context: PipelineContext): GameState;
}
