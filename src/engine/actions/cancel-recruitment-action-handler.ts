import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  CancelRecruitmentAction,
} from "@/domain/game/action.schema";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import type { ActionHandler } from "@/engine/actions/action-handler";

export class CancelRecruitmentActionHandler implements ActionHandler {
  private recruitmentManager = new RecruitmentQueueManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "CANCEL_RECRUITMENT") {
      return state;
    }
    const cancelAction = action as CancelRecruitmentAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.recruitmentManager.cancelOrder(
          nation,
          cancelAction.orderId,
        ),
      },
    };
  }
}
