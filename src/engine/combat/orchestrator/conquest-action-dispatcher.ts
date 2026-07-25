import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ConquestActionValidator } from "@/engine/combat/validation/conquest-action-validator";

export class ConquestActionDispatcher {
  private validator = new ConquestActionValidator();

  public validateAndEnqueue(
    state: GameState,
    action: GameAction,
    queue: GameAction[],
  ): void {
    this.validator.validateAttack(state, action);
    queue.push(action);
  }
}
