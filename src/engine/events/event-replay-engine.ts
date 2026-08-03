import { GameState } from "@/domain/game/game-state.schema";
import { DomainEvent } from "@/domain/events/domain-event.schema";
import { ActionRouter } from "@/engine/actions/action-router";
import { GameAction } from "@/domain/game/action.schema";

export class EventReplayEngine {
  private actionRouter = new ActionRouter();

  public replayStream(
    initialCheckpoint: GameState,
    events: DomainEvent[],
  ): GameState {
    let currentState = initialCheckpoint;

    const sortedEvents = [...events].sort(
      (a, b) => a.metadata.sequence - b.metadata.sequence,
    );

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      if (!event) continue;

      const action = event.actionPayload as unknown as GameAction;
      if (action && action.type) {
        currentState = this.actionRouter.route(currentState, action);
      }
    }

    return currentState;
  }
}
