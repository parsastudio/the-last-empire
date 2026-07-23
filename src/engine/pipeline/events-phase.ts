import type { GameState } from "@/domain/game/game-state.schema";
import { EventEvaluator } from "@/engine/politics/event-evaluator";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class EventsPhase implements TurnPhase {
  private eventEvaluator = new EventEvaluator();

  public execute(context: PipelineContext): GameState {
    return this.eventEvaluator.evaluateTurnEvents(context.state);
  }
}
