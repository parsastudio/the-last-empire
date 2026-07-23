import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  UnlockDoctrineAction,
} from "@/modules/game-engine/schemas/action.schema";
import { DoctrinesManager } from "@/modules/politics/domain/doctrines-manager";
import type { ActionHandler } from "./action-handler";

export class UnlockDoctrineActionHandler implements ActionHandler {
  private doctrinesManager = new DoctrinesManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "UNLOCK_DOCTRINE") {
      return state;
    }
    const doctrineAction = action as UnlockDoctrineAction;
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }

    const updatedDoctrines = this.doctrinesManager.purchaseDoctrine(
      source.doctrines,
      doctrineAction.doctrineId,
    );

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: {
          ...source,
          doctrines: updatedDoctrines,
        },
      },
    };
  }
}
