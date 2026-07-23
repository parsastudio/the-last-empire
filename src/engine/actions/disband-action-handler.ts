import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  DisbandUnitAction,
} from "@/domain/game/action.schema";
import { DisbandManager } from "@/engine/military/disband-manager";
import type { ActionHandler } from "./action-handler";

export class DisbandActionHandler implements ActionHandler {
  private disbandManager = new DisbandManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "DISBAND_UNIT") {
      return state;
    }
    const disbandAction = action as DisbandUnitAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.disbandManager.disbandUnits(
          nation,
          disbandAction.unitType,
          disbandAction.quantity,
        ),
      },
    };
  }
}
