import type { GameState } from "@/domain/game/game-state.schema";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { AttritionManager } from "@/engine/military/attrition-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";

export class MilitaryPhase implements TurnPhase {
  private recruitmentQueue = new RecruitmentQueueManager();
  private attritionManager = new AttritionManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
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
