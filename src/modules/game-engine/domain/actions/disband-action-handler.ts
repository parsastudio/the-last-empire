import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  DisbandUnitAction,
} from "@/modules/game-engine/schemas/action.schema";
import { DisbandManager } from "@/modules/military/domain/disband-manager";
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
