import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  RecruitUnitAction,
} from "@/modules/game-engine/schemas/action.schema";
import { RecruitmentQueueManager } from "@/modules/military/domain/recruitment-queue";
import type { ActionHandler } from "./action-handler";

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
