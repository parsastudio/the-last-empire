import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { StateValidator } from "./state-validator";

export class ActionQueue {
  private queue: GameAction[] = [];
  private validator: StateValidator;

  constructor(validator?: StateValidator) {
    this.validator = validator ?? new StateValidator();
  }

  public enqueue(state: GameState, action: GameAction): void {
    this.validator.validateAction(state, action);
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
