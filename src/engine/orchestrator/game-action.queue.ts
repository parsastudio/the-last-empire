import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { EventSystem } from "@/engine/politics/event-system";
import { ActionPrioritySorter } from "./action-priority-sorter";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { ActionQueue } from "./action-queue";
import { ActionRouter } from "@/engine/actions/action-router";
import { StateValidator } from "@/engine/validation/state-validator";
import { GridState } from "@/engine/combat/state/grid-state";

export class GameActionQueue {
  private actionQueue = new ActionQueue();
  private prioritySorter = new ActionPrioritySorter();
  private actionRouter = new ActionRouter();
  private validator = new StateValidator();

  public enqueue(state: GameState, action: GameAction): void {
    this.actionQueue.enqueue(state, action);
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
        const stateWithGrid = { ...nextState, gridState } as GameState & {
          gridState: GridState;
        };
        this.validator.validateAction(stateWithGrid, action);
        nextState = this.actionRouter.route(nextState, action);

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
      } catch {
        continue;
      }
    }

    this.actionQueue.clear();
    return nextState;
  }
}
