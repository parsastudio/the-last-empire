import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { StateValidator } from "@/engine/validation/state-validator";

export class ActionQueue {
  private queue: GameAction[] = [];
  private validator = new StateValidator();

  public enqueue(state: GameState, action: GameAction): void {
    this.validator.validateAction(state, action);
    this.validator.verifyConcurrency(this.queue, action);
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
