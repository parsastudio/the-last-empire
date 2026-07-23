import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  RepayDebtAction,
} from "@/modules/game-engine/schemas/action.schema";
import { GameError } from "@/core/errors/game-error";
import { ActionHandler } from "./action-handler";

export class RepayDebtActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "REPAY_DEBT") {
      return state;
    }
    const repayAction = action as RepayDebtAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    if (nation.treasury < repayAction.amount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough money in treasury for requested manual debt repayment",
      );
    }
    const maxRepayable = Math.min(repayAction.amount, nation.nationalDebt);
    const updatedNation = {
      ...nation,
      treasury: nation.treasury - maxRepayable,
      nationalDebt: nation.nationalDebt - maxRepayable,
    };
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: updatedNation,
      },
    };
  }
}
