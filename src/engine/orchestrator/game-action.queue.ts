import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { EventLogger } from "@/engine/event-logger";
import { ActionRouter } from "@/engine/actions/action-router";
import { GridState } from "@/engine/combat/state/grid-state";
import { ActionPrioritySorter } from "./action-priority-sorter";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { StateValidator } from "@/engine/validation/state-validator";
import { ActionConcurrencyChecker } from "@/engine/validation/action-concurrency-checker";
import { deepClone } from "@/domain/shared/deep-clone";

export class ActionQueue {
  private queue: GameAction[] = [];
  private validator: StateValidator;
  private concurrencyChecker = new ActionConcurrencyChecker();
  private actionRouter = new ActionRouter();
  private projectedState: GameState | null = null;

  constructor(validator?: StateValidator) {
    this.validator = validator ?? new StateValidator();
  }

  public navigate(state: GameState, action: GameAction): void {
    const rawGridState = (state as { gridState?: GridState }).gridState;
    if (
      !this.projectedState ||
      this.projectedState.gameId !== state.gameId ||
      this.projectedState.currentTurn !== state.currentTurn
    ) {
      const stateCopy: Omit<GameState, "gridState"> & { gridState?: unknown } =
        { ...state };
      if ("gridState" in stateCopy) {
        delete stateCopy.gridState;
      }
      this.projectedState = deepClone(stateCopy as GameState);
    }
    if (this.projectedState && rawGridState) {
      (this.projectedState as GameState & { gridState?: GridState }).gridState =
        rawGridState;
    }
    if (this.projectedState) {
      this.validator.validateAction(this.projectedState, action);
    }
    this.concurrencyChecker.verifyConcurrencies(this.queue, action);
    this.queue.push(action);
    if (this.projectedState) {
      this.projectedState = this.actionRouter.route(
        this.projectedState,
        action,
      );
      const cleanedProjectedState: GameState & { gridState?: unknown } = {
        ...this.projectedState,
      };
      delete cleanedProjectedState.gridState;
      this.projectedState = cleanedProjectedState as GameState;
    }
  }

  public getQueue(): readonly GameAction[] {
    return Object.freeze([...this.queue]);
  }

  public enqueue(state: GameState, action: GameAction): void {
    this.navigate(state, action);
  }

  public clear(): void {
    this.queue = [];
    this.projectedState = null;
  }

  public size(): number {
    return this.queue.length;
  }
}

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
