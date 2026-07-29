import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  SetTariffRateAction,
} from "@/domain/game/action.schema";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class SetTariffRateActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "SET_TARIFF_RATE") {
      return state;
    }
    const tariffAction = action as SetTariffRateAction;
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
          tariffRate: tariffAction.newRate,
        },
      },
    };
  }
}
