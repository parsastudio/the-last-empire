import { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { CORE_DILEMMA_EVENTS, DilemmaEvent } from "@geopolitics/domain";

export class DilemmaTurnEvaluator {
  public static readonly WINDOW_SIZE = 8;
  public static readonly FIRST_VALID_TURN = 2;

  public static getWindowBounds(turn: number): { start: number; end: number } {
    if (turn < this.FIRST_VALID_TURN) {
      return {
        start: this.FIRST_VALID_TURN,
        end: this.FIRST_VALID_TURN + this.WINDOW_SIZE - 1,
      };
    }
    const offset = turn - this.FIRST_VALID_TURN;
    const windowIndex = Math.floor(offset / this.WINDOW_SIZE);
    const start = this.FIRST_VALID_TURN + windowIndex * this.WINDOW_SIZE;
    const end = start + this.WINDOW_SIZE - 1;
    return { start, end };
  }

  public static scheduleTurnForWindow(
    windowStart: number,
    windowEnd: number,
    prng: SeededRandom,
  ): number {
    const range = windowEnd - windowStart + 1;
    const offset = Math.floor(prng.nextFloat() * range);
    return windowStart + offset;
  }

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

    const currentTurn = state.currentTurn;
    if (currentTurn < this.FIRST_VALID_TURN) {
      return state;
    }

    const currentWindow = this.getWindowBounds(currentTurn);

    let scheduledTurn = state.scheduledDilemmaTurn;
    let isSchedulingNew = false;

    if (
      !scheduledTurn ||
      scheduledTurn < currentWindow.start ||
      scheduledTurn > currentWindow.end
    ) {
      scheduledTurn = this.scheduleTurnForWindow(
        currentWindow.start,
        currentWindow.end,
        prng,
      );
      isSchedulingNew = true;
    }

    if (currentTurn !== scheduledTurn) {
      if (isSchedulingNew) {
        return {
          ...state,
          scheduledDilemmaTurn: scheduledTurn,
        };
      }
      return state;
    }

    const eventIndex = Math.floor(
      prng.nextFloat() * CORE_DILEMMA_EVENTS.length,
    );
    const selectedEvent: DilemmaEvent = CORE_DILEMMA_EVENTS[eventIndex]!;

    return {
      ...state,
      activeDilemma: selectedEvent,
      scheduledDilemmaTurn: null,
    };
  }
}
