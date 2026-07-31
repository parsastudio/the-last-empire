import type { GameState } from "@/domain/game/game-state.schema";
import { EventSystem } from "@/engine/politics/event-system";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";

export class EventsPhase implements TurnPhase {
  private eventSystem = new EventSystem();

  public execute(context: PipelineContext): GameState {
    return this.eventSystem.evaluateTurnEvents(context.state);
  }
}
