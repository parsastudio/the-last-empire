import { GameState } from "@/domain/game/game-state.schema";
import { GameEvent } from "@/domain/game/events.schema";
import { EventEffectsApplier } from "@/engine/politics/event-effects-applier";
import { EventLogger } from "@/engine/event-logger";
import { EventFlagsManager } from "./event-flags.manager";

export class EventChoiceApplier {
  private applier = new EventEffectsApplier();
  private flagsManager = new EventFlagsManager();
  private logger = new EventLogger();

  public selectChoice(
    state: GameState,
    nationId: string,
    event: GameEvent,
    choiceId: string,
  ): GameState {
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) {
      return state;
    }

    const updatedNation = this.applier.applyChoiceEffects(nation, choice);
    state.nations[nationId] = updatedNation;

    state.eventFlags = this.flagsManager.updateEventFlags(
      state.eventFlags,
      choice,
    );

    const entry = this.logger.createEntry(
      state.currentTurn,
      nationId,
      "INFO",
      `Resolved event: ${event.title} - Chosen: ${choice.description}`,
    );
    state.turnLogs.push(entry);

    return state;
  }
}
