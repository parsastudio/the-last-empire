import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class DoctrineUnlockValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "UNLOCK_DOCTRINE";
  }

  public validate(state: GameState, action: GameAction): void {
    const sourceNation = state.nations[action.nationId];
    if (sourceNation && sourceNation.doctrines.doctrinePoints < 3) {
      throw new GameError(
        "INVALID_ACTION",
        "Insufficient doctrine points to unlock doctrines",
      );
    }
  }
}
