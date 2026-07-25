import { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { TurnPipeline } from "@/engine/turn-pipeline";

export class TurnPhaseOrchestrator {
  private pipeline = new TurnPipeline();

  public executePhases(state: GameState, prng: SeededRandom): GameState {
    return this.pipeline.processTurn(state, prng);
  }
}
