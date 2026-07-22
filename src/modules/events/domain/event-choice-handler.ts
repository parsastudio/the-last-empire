import type { GameState } from "@/core/types/game-state.types";
import type { GameEvent } from "@/core/types/events.types";
import { EventEffectsApplier } from "./event-effects-applier";
import { EventLogger } from "@/modules/game-engine/domain/event-logger";

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
