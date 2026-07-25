import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  UnlockDoctrineAction,
} from "@/domain/game/action.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import type { ActionHandler } from "@/engine/actions/action-handler";

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
