import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, SetTaxRateAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class TaxRateValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "SET_TAX_RATE";
  }

  public validate(state: GameState, action: GameAction): void {
    const taxAction = action as SetTaxRateAction;
    if (taxAction.newRate < 0 || taxAction.newRate > 100) {
      throw new GameError(
        "INVALID_ACTION",
        "Tax rate must be between 0 and 100",
      );
    }
  }
}
