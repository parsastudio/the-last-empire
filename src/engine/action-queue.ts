import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { StateValidator } from "./validation/state-validator";
import { ActionConcurrencyChecker } from "./validation/action-concurrency-checker";
import { ActionRouter } from "./actions/action-router";
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

  public enqueue(state: GameState, action: GameAction): void {
    if (
      !this.projectedState ||
      this.projectedState.gameId !== state.gameId ||
      this.projectedState.currentTurn !== state.currentTurn
    ) {
      this.projectedState = deepClone(state);
    }
    this.validator.validateAction(this.projectedState, action);
    this.concurrencyChecker.verifyConcurrencies(this.queue, action);
    this.queue.push(action);
    this.projectedState = this.actionRouter.route(this.projectedState, action);
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
