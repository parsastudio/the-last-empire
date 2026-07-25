import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ConquestActionValidator } from "@/engine/combat/validation/conquest-action-validator";

export class AttackConquestHandlerValidator {
  private actionValidator = new ConquestActionValidator();

  public validateAndIntercept(state: GameState, action: GameAction): void {
    this.actionValidator.validateAttack(state, action);
  }
}
