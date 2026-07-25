import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, DisbandUnitAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class DisbandUnitValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "DISBAND_UNIT";
  }

  public validate(state: GameState, action: GameAction): void {
    const disbandAction = action as DisbandUnitAction;
    if (disbandAction.quantity <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Disband quantity must be greater than zero",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (sourceNation) {
      const currentCount =
        disbandAction.unitType === "INFANTRY"
          ? sourceNation.military.infantry
          : disbandAction.unitType === "AIR_FORCE"
            ? sourceNation.military.airForce
            : sourceNation.military.droneMissile;

      if (currentCount < disbandAction.quantity) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot disband more units than available in the military stack",
        );
      }
    }
  }
}
