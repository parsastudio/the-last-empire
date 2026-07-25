import { GameState } from "@/domain/game/game-state.schema";
import {
  GameAction,
  CancelRecruitmentAction,
} from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class RecruitmentCancelValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "CANCEL_RECRUITMENT";
  }

  public validate(state: GameState, action: GameAction): void {
    const cancelAction = action as CancelRecruitmentAction;
    const sourceNation = state.nations[action.nationId];
    if (sourceNation) {
      const orderExists = sourceNation.recruitmentQueue.some(
        (o) => o.id === cancelAction.orderId,
      );
      if (!orderExists) {
        throw new GameError(
          "INVALID_ACTION",
          "Recruitment order not found in the queue",
        );
      }
    }
  }
}
