import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { StateValidator } from "@/engine/validation/state-validator";
import { ActionConcurrencyChecker } from "@/engine/validation/action-concurrency-checker";
import { ActionRouter } from "@/engine/actions/action-router";
import { deepClone } from "@/domain/shared/deep-clone";
import { GridState } from "@/engine/combat/state/grid-state";

export class ActionQueue {
  private queue: GameAction[] = [];
  private validator: StateValidator;
  private concurrencyChecker = new ActionConcurrencyChecker();
  private actionRouter = new ActionRouter();
  private projectedState: GameState | null = null;

  constructor(validator?: StateValidator) {
    this.validator = validator ?? new StateValidator();
  }

  public enqueue(state: GameState, action: GameAction): void {
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

  public clear(): void {
    this.queue = [];
    this.projectedState = null;
  }

  public size(): number {
    return this.queue.length;
  }
}
