import type { GameState } from "@/domain/game/game-state.schema";
import type { GameEvent } from "@/domain/game/events.schema";
import { EventEffectsApplier } from "@/engine/politics/event-effects-applier";
import { EventLogger } from "@/engine/event-logger";

export class EventChoiceHandler {
  private applier = new EventEffectsApplier();
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

    const currentFlags = { ...state.eventFlags };
    if (choice.effects.setFlags) {
      for (const flag of choice.effects.setFlags) {
        currentFlags[flag] = true;
      }
    }

    state.eventFlags = currentFlags;

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
