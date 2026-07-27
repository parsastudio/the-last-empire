import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateValidator } from "@/engine/validation/state-validator";
import { ActionConcurrencyChecker } from "@/engine/validation/action-concurrency-checker";
import { ActionRouter } from "@/engine/actions/action-router";
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
