import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { EventLogger } from "@/engine/event-logger";
import { ActionRouter } from "@/engine/actions/action-router";
import { GridState } from "@/engine/combat/state/grid-state";
import { ActionPrioritySorter } from "./action-priority-sorter";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { ActionQueue } from "./action-queue";

export class GameActionQueue {
  private actionQueue = new ActionQueue();
  private eventLogger = new EventLogger();
  private actionRouter = new ActionRouter();
  private prioritySorter = new ActionPrioritySorter();

  public enqueue(
    state: GameState,
    gridState: GridState,
    action: GameAction,
  ): void {
    const stateWithGrid = { ...state, gridState };
    this.actionQueue.enqueue(stateWithGrid, action);
  }

  public processActions(
    state: GameState,
    gridState: GridState,
    prng: SeededRandom,
  ): GameState {
    const rawQueue = this.actionQueue.getQueue();
    const sortedActions = this.prioritySorter.sortActions(rawQueue, prng);

    let nextState = state;

    for (const action of sortedActions) {
      try {
        const stateWithGrid = { ...nextState, gridState };
        const routedState = this.actionRouter.route(stateWithGrid, action);
        const cleanedState: GameState & { gridState?: unknown } = {
          ...routedState,
        };
        delete cleanedState.gridState;
        nextState = cleanedState as GameState;

        const logEntry = this.eventLogger.createEntry(
          nextState.currentTurn,
          action.nationId,
          "INFO",
          `Action processed: ${action.type}`,
        );
        nextState = {
          ...nextState,
          turnLogs: [...nextState.turnLogs, logEntry],
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown execution error";
        const logEntry = this.eventLogger.createEntry(
          nextState.currentTurn,
          action.nationId,
          "CRITICAL",
          `Action failed during execution: ${action.type}. Reason: ${errorMessage}`,
        );
        nextState = {
          ...nextState,
          turnLogs: [...nextState.turnLogs, logEntry],
        };
      }
    }

    this.actionQueue.clear();
    return nextState;
  }
}
