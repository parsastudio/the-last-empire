import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  SetTaxRateAction,
} from "@/domain/game/action.schema";
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

    const oldRate = nation.taxRate;
    const delta = Math.abs(taxAction.newRate - oldRate);
    let stabilityPenalty = 0;
    if (delta > 15) {
      stabilityPenalty = Math.floor(delta * 0.8);
    }

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: {
          ...nation,
          taxRate: taxAction.newRate,
          government: {
            ...nation.government,
            stability: Math.max(
              0,
              nation.government.stability - stabilityPenalty,
            ),
          },
        },
      },
    };
  }
}
