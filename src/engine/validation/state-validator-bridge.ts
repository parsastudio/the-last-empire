import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ConquestActionValidator } from "@/engine/combat/validation/conquest-action-validator";

export class StateValidatorBridge {
  private conquestValidator = new ConquestActionValidator();

  public validateAction(state: GameState, action: GameAction): void {
    if (action.type === "ATTACK") {
      this.conquestValidator.validateAttack(state, action);
    }
  }
}
