import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { StateValidator } from "./state-validator";
import { ActionConcurrencyChecker } from "./action-concurrency-checker";

export class ActionQueue {
  private queue: GameAction[] = [];
  private validator: StateValidator;
  private concurrencyChecker = new ActionConcurrencyChecker();

  constructor(validator?: StateValidator) {
    this.validator = validator ?? new StateValidator();
  }

  public enqueue(state: GameState, action: GameAction): void {
    this.validator.validateAction(state, action);
    this.concurrencyChecker.verifyConcurrencies(this.queue, action);
    this.queue.push(action);
  }

  public getQueue(): readonly GameAction[] {
    return Object.freeze([...this.queue]);
  }

  public clear(): void {
    this.queue = [];
  }

  public size(): number {
    return this.queue.length;
  }
}
