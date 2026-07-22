import type { GameState } from "@/core/types/game-state.types";
import { RecruitmentQueueManager } from "@/modules/military/domain/recruitment-queue";
import { AttritionManager } from "@/modules/military/domain/attrition-manager";
import { TurnPhase } from "./turn-phase";

export class MilitaryPhase implements TurnPhase {
  private recruitmentQueue = new RecruitmentQueueManager();
  private attritionManager = new AttritionManager();

  public execute(state: GameState): GameState {
    const nextState = { ...state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = { ...nation };
      updated = this.recruitmentQueue.processTurnQueue(updated);
      updated = this.attritionManager.applyUpkeepDeficitAttrition(updated);

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
