import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  InvestDiplomacyAction,
} from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { GameError } from "@/domain/shared/game-error";

export class InvestDiplomacyActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "INVEST_DIPLOMACY") {
      return state;
    }
    const diplomacyAction = action as InvestDiplomacyAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    if (nation.treasury < diplomacyAction.amount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient treasury for diplomatic campaign",
      );
    }

    const updatedReputation = Math.min(100, nation.globalReputation + 15);

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: {
          ...nation,
          treasury: nation.treasury - diplomacyAction.amount,
          globalReputation: updatedReputation,
        },
      },
    };
  }
}
