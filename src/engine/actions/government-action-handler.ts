import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  ChangeGovernmentAction,
} from "@/domain/game/action.schema";
import { RegimeChangeManager } from "@/engine/politics/regime-change-manager";
import { ActionHandler } from "./action-handler";

export class GovernmentActionHandler implements ActionHandler {
  private manager = new RegimeChangeManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "CHANGE_GOVERNMENT") {
      return state;
    }
    const govAction = action as ChangeGovernmentAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.manager.changeRegime(
          nation,
          govAction.newGovernment,
        ),
      },
    };
  }
}
