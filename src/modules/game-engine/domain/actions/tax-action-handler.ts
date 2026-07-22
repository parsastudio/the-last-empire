import type { GameState, GameAction, SetTaxRateAction } from "@/core/types";
import { ActionHandler } from "./action-handler";

export class TaxActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "SET_TAX_RATE") {
      return state;
    }
    const setTaxAction = action as SetTaxRateAction;
    const nation = state.nations[action.nationId];
    if (nation) {
      nation.taxRate = setTaxAction.newRate;
    }
    return state;
  }
}
