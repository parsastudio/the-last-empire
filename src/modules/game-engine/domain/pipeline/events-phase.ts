import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { EventEvaluator } from "@/modules/events/domain/event-evaluator";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class EventsPhase implements TurnPhase {
  private eventEvaluator = new EventEvaluator();

  public execute(context: PipelineContext): GameState {
    return this.eventEvaluator.evaluateTurnEvents(context.state);
  }
}
