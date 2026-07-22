import type {
  GameState,
  GameAction,
  RecruitUnitAction,
  DeclareWarAction,
} from "@/core/types";
import { RecruitmentQueueManager } from "@/modules/military/domain/recruitment-queue";
import { ActionHandler } from "./action-handler";

export class MilitaryActionHandler implements ActionHandler {
  private recruitmentManager = new RecruitmentQueueManager();

  public execute(state: GameState, action: GameAction): GameState {
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }

    if (action.type === "RECRUIT_UNIT") {
      const recruitAction = action as RecruitUnitAction;
      state.nations[action.nationId] = this.recruitmentManager.enqueueOrder(
        source,
        recruitAction.unitType,
        recruitAction.quantity,
      );
    } else if (action.type === "DECLARE_WAR") {
      const warAction = action as DeclareWarAction;
      const target = state.nations[warAction.targetNationId];
      if (target && target.isAlive) {
        source.aggressionScore = Math.min(100, source.aggressionScore + 25);
        const relToTarget = source.relations[warAction.targetNationId];
        if (relToTarget) {
          source.relations[warAction.targetNationId] = {
            ...relToTarget,
            stance: "WAR",
          };
        }
        const relToSource = target.relations[action.nationId];
        if (relToSource) {
          target.relations[action.nationId] = {
            ...relToSource,
            stance: "WAR",
          };
        }
      }
    } else if (action.type === "ATTACK") {
      source.aggressionScore = Math.min(100, source.aggressionScore + 10);
    }

    return state;
  }
}
