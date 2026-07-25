import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  RecruitUnitAction,
} from "@/domain/game/action.schema";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class RecruitActionHandler implements ActionHandler {
  private recruitmentManager = new RecruitmentQueueManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "RECRUIT_UNIT") {
      return state;
    }
    const recruitAction = action as RecruitUnitAction;
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.recruitmentManager.enqueueOrder(
          source,
          recruitAction.unitType,
          recruitAction.quantity,
        ),
      },
    };
  }
}
