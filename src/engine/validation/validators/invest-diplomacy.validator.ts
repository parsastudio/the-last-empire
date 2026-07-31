import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, InvestDiplomacyAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class InvestDiplomacyValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "INVEST_DIPLOMACY";
  }

  public validate(state: GameState, action: GameAction): void {
    const diplomacyAction = action as InvestDiplomacyAction;
    if (diplomacyAction.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Diplomatic investment amount must be positive",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Nation does not exist");
    }
    if (sourceNation.treasury < diplomacyAction.amount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient treasury for diplomatic campaign",
      );
    }
  }
}
