import type { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";

export class FinancialConcurrencyRules {
  public verify(actionList: GameAction[], newAction: GameAction): void {
    if (newAction.type === "REQUEST_LOAN") {
      const hasLoanThisTurn = actionList.some(
        (a) => a.type === "REQUEST_LOAN" && a.nationId === newAction.nationId,
      );
      if (hasLoanThisTurn) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot request multiple loans in a single turn",
        );
      }
      const hasTaxRateChangeThisTurn = actionList.some(
        (a) => a.type === "SET_TAX_RATE" && a.nationId === newAction.nationId,
      );
      if (hasTaxRateChangeThisTurn) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot change tax rate and request a loan in the same turn",
        );
      }
    }

    if (newAction.type === "SET_TAX_RATE") {
      const hasLoanThisTurn = actionList.some(
        (a) => a.type === "REQUEST_LOAN" && a.nationId === newAction.nationId,
      );
      if (hasLoanThisTurn) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot change tax rate and request a loan in the same turn",
        );
      }
    }
  }
}
