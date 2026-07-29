import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, RepayDebtAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class RepayDebtValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "REPAY_DEBT";
  }

  public validate(state: GameState, action: GameAction): void {
    const repayAction = action as RepayDebtAction;
    if (repayAction.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Repayment amount must be positive",
      );
    }

    const sourceNation = state.nations[action.nationId];
    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Nation does not exist");
    }

    if (sourceNation.nationalDebt <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Nation has no outstanding national debt to repay",
      );
    }

    if (sourceNation.treasury < repayAction.amount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Insufficient treasury to repay debt. Required: ${repayAction.amount}, Available: ${sourceNation.treasury}`,
      );
    }
  }
}
