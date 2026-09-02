import { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { CORE_DILEMMA_EVENTS, DilemmaEvent } from "@geopolitics/domain";

export class DilemmaTurnEvaluator {
  public static evaluate(state: GameState, prng: SeededRandom): GameState {
    if (state.activeDilemma || state.isGameOver) {
      return state;
    }

    const humanCanonical = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const humanNation =
      state.nations[humanCanonical] || state.nations[state.humanNationId];

    if (!humanNation || !humanNation.isAlive) {
      return state;
    }

    const turn = state.currentTurn;
    const isScheduledTurn = turn >= 2 && turn % 3 === 0;
    const isCrisisTurn =
      humanNation.government.stability < 35 ||
      humanNation.nationalDebt > 50_000_000_000 ||
      humanNation.globalReputation < -25;

    const roll = prng.nextFloat();
    const shouldTrigger = isScheduledTurn || (isCrisisTurn && roll < 0.5);

    if (!shouldTrigger) {
      return state;
    }

    const eventIndex = Math.floor(
      prng.nextFloat() * CORE_DILEMMA_EVENTS.length,
    );
    const selectedEvent: DilemmaEvent = CORE_DILEMMA_EVENTS[eventIndex]!;

    return {
      ...state,
      activeDilemma: selectedEvent,
    };
  }
}
