import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, RequestLoanAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { LoanManager } from "@/engine/economy/loan-manager";
import { ActionValidator } from "./action-validator.interface";

export class LoanRequestValidator implements ActionValidator {
  private loanManager = new LoanManager();

  public supports(actionType: string): boolean {
    return actionType === "REQUEST_LOAN";
  }

  public validate(state: GameState, action: GameAction): void {
    const loanAction = action as RequestLoanAction;
    if (loanAction.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Requested loan amount must be positive",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (sourceNation) {
      const hasBankruptcyHoliday = sourceNation.activeModifiers.some(
        (m) => m.id === "bankruptcy-debt-holiday",
      );
      if (hasBankruptcyHoliday) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot request loans while under Bankruptcy Restructuring Period",
        );
      }
      const creditRating = this.loanManager.calculateCreditRating(sourceNation);
      const effectiveTaxRateForCredit = Math.min(20, sourceNation.taxRate);
      const taxIncome = sourceNation.gdp * (effectiveTaxRateForCredit / 100);
      const maxDebtLimit = Math.min(
        Math.floor(sourceNation.gdp * 0.2 * (creditRating / 100)),
        Math.floor(taxIncome * 5 * (creditRating / 100)),
      );
      const availableCredit = Math.max(
        0,
        maxDebtLimit - sourceNation.nationalDebt,
      );
      const totalRepayable =
        loanAction.amount + Math.floor(loanAction.amount * 0.05);
      if (totalRepayable > availableCredit) {
        throw new GameError(
          "INVALID_ACTION",
          "Requested loan inclusive of interest exceeds available credit limit",
        );
      }
    }
  }
}
