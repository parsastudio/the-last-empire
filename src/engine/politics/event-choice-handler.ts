import { GameState } from "@/domain/game/game-state.schema";
import { GameEvent } from "@/domain/game/events.schema";
import { EventChoiceApplier } from "./events/event-choice.applier";

export class EventChoiceHandler {
  private applier = new EventChoiceApplier();

  public selectChoice(
    state: GameState,
    nationId: string,
    event: GameEvent,
    choiceId: string,
  ): GameState {
    return this.applier.selectChoice(state, nationId, event, choiceId);
  }
}
