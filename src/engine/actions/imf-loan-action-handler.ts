import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  RequestLoanAction,
} from "@/domain/game/action.schema";
import { ImfLoanManager } from "@/engine/economy/imf-loan-manager";
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
