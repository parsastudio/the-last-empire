import type { GameState } from "@/core/types/game-state.types";
import type {
  GameAction,
  ChangeGovernmentAction,
} from "@/core/types/actions.types";
import { RegimeChangeManager } from "@/modules/politics/domain/regime-change-manager";
import { ActionHandler } from "./action-handler";

export class GovernmentActionHandler implements ActionHandler {
  private manager = new RegimeChangeManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "CHANGE_GOVERNMENT") {
      return state;
    }
    const govAction = action as ChangeGovernmentAction;
    const nation = state.nations[action.nationId];
    if (nation) {
      state.nations[action.nationId] = this.manager.changeRegime(
        nation,
        govAction.newGovernment,
      );
    }
    return state;
  }
}
