import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { EventEvaluator } from "@/modules/events/domain/event-evaluator";
import { TurnPhase } from "./turn-phase";

export class EventsPhase implements TurnPhase {
  private eventEvaluator = new EventEvaluator();

  public execute(state: GameState): GameState {
    return this.eventEvaluator.evaluateTurnEvents(state);
  }
}
