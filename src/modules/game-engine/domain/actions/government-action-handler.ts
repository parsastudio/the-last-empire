import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  ChangeGovernmentAction,
} from "@/modules/game-engine/schemas/action.schema";
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
