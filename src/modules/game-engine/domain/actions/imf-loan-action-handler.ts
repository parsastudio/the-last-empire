import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  RequestLoanAction,
} from "@/modules/game-engine/schemas/action.schema";
import { ImfLoanManager } from "@/modules/trade/domain/imf-loan-manager";
import type { ActionHandler } from "./action-handler";

export class ImfLoanActionHandler implements ActionHandler {
  private imfLoanManager = new ImfLoanManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "REQUEST_LOAN") {
      return state;
    }
    const loanAction = action as RequestLoanAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.imfLoanManager.requestImfLoan(
          nation,
          loanAction.amount,
        ),
      },
    };
  }
}
