import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { deepClone } from "@/core/utils/deep-clone";
import { TurnPhase } from "./pipeline/turn-phase";
import { ModifiersPhase } from "./pipeline/modifiers-phase";
import { EconomyPhase } from "./pipeline/economy-phase";
import { MilitaryPhase } from "./pipeline/military-phase";
import { PoliticsPhase } from "./pipeline/politics-phase";
import { DiplomacyPhase } from "./pipeline/diplomacy-phase";
import { EventsPhase } from "./pipeline/events-phase";

export class TurnPipeline {
  private phases: TurnPhase[] = [
    new ModifiersPhase(),
    new EconomyPhase(),
    new MilitaryPhase(),
    new PoliticsPhase(),
    new DiplomacyPhase(),
    new EventsPhase(),
  ];

  public processTurn(state: GameState): GameState {
    let nextState = deepClone(state);

    for (const phase of this.phases) {
      nextState = phase.execute(nextState);
    }

    return nextState;
  }
}
