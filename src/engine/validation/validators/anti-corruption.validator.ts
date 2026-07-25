import { GameState } from "@/domain/game/game-state.schema";
import {
  GameAction,
  AntiCorruptionDriveAction,
} from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class AntiCorruptionValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "ANTI_CORRUPTION_DRIVE";
  }

  public validate(state: GameState, action: GameAction): void {
    const antiAction = action as AntiCorruptionDriveAction;
    if (antiAction.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Anti-corruption drive investment must be positive",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (sourceNation && sourceNation.treasury < antiAction.amount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient treasury to fund anti-corruption drive",
      );
    }
  }
}
