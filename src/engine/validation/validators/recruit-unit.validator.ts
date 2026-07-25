import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, RecruitUnitAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";
import { ActionValidator } from "./action-validator.interface";

export class RecruitUnitValidator implements ActionValidator {
  private resourceDependencyManager = new ResourceDependencyManager();

  public supports(actionType: string): boolean {
    return actionType === "RECRUIT_UNIT";
  }

  public validate(state: GameState, action: GameAction): void {
    const recruitAction = action as RecruitUnitAction;
    if (recruitAction.quantity <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Recruitment quantity must be greater than zero",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (sourceNation) {
      this.resourceDependencyManager.validateUnitRecruitmentResources(
        sourceNation,
        recruitAction.unitType,
        recruitAction.quantity,
      );
    }
  }
}
