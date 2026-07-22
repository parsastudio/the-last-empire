import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  SetTaxRateAction,
} from "@/modules/game-engine/schemas/action.schema";
import { ActionHandler } from "./action-handler";

export class TaxActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "SET_TAX_RATE") {
      return state;
    }
    const taxAction = action as SetTaxRateAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: {
          ...nation,
          taxRate: taxAction.newRate,
        },
      },
    };
  }
}
