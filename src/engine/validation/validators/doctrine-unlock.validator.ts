import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, UnlockDoctrineAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";
import { DEFAULT_DOCTRINES } from "@/engine/politics/doctrines-list.config";

export class DoctrineUnlockValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "UNLOCK_DOCTRINE";
  }

  public validate(state: GameState, action: GameAction): void {
    const unlockAction = action as UnlockDoctrineAction;
    const sourceNation = state.nations[action.nationId];

    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Nation does not exist");
    }

    const doctrine = DEFAULT_DOCTRINES.find(
      (d) => d.id === unlockAction.doctrineId,
    );

    const requiredCost = doctrine ? doctrine.cost : 3;

    if (sourceNation.doctrines.doctrinePoints < requiredCost) {
      throw new GameError(
        "INVALID_ACTION",
        `Insufficient doctrine points. Required: ${requiredCost}, Available: ${sourceNation.doctrines.doctrinePoints}`,
      );
    }
  }
}
