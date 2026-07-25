import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { deepClone } from "@/domain/shared/deep-clone";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { ModifiersPhase } from "@/engine/pipeline/modifiers-phase";
import { EconomyPhase } from "@/engine/pipeline/economy-phase";
import { MilitaryPhase } from "@/engine/pipeline/military-phase";
import { PoliticsPhase } from "@/engine/pipeline/politics-phase";
import { DiplomacyPhase } from "@/engine/pipeline/diplomacy-phase";
import { EventsPhase } from "@/engine/pipeline/events-phase";

export class TurnPipeline {
  private phases: TurnPhase[];

  constructor(phases?: TurnPhase[]) {
    this.phases = phases ?? [
      new ModifiersPhase(),
      new EconomyPhase(),
      new MilitaryPhase(),
      new PoliticsPhase(),
      new DiplomacyPhase(),
      new EventsPhase(),
    ];
  }

  public processTurn(state: GameState, prng: SeededRandom): GameState {
    const nextState = deepClone(state);
    const context: PipelineContext = {
      state: nextState,
      prng,
    };

    for (const phase of this.phases) {
      context.state = phase.execute(context);
    }

    return context.state;
  }
}
