import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { EventSystem } from "@/engine/politics/event-system";
import { ActionPrioritySorter } from "./action-priority-sorter";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { ActionQueue } from "./action-queue";

export class GameActionQueue {
  private actionQueue = new ActionQueue();
  private prioritySorter = new ActionPrioritySorter();

  public enqueue(
    state: GameState,
    gridState: unknown,
    action: GameAction,
  ): void {
    this.actionQueue.enqueue(state, action);
  }

  public processActions(
    state: GameState,
    _gridState: unknown,
    prng: SeededRandom,
  ): GameState {
    const rawQueue = this.actionQueue.getQueue();
    const sortedActions = this.prioritySorter.sortActions(rawQueue, prng);

    let nextState = state;

    for (const action of sortedActions) {
      const logEntry = EventSystem.createLogEntry(
        nextState.currentTurn,
        action.nationId,
        "INFO",
        `Action processed: ${action.type}`,
      );
      nextState = {
        ...nextState,
        turnLogs: [...nextState.turnLogs, logEntry],
      };
    }

    this.actionQueue.clear();
    return nextState;
  }
}
