import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export class ImfLoanManager {
  private readonly defaultInterestRate = 0.05;

  public requestImfLoan(nation: Nation, amount: number): Nation {
    if (amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Loan request amount must be positive",
      );
    }

    const interestAmount = Math.floor(amount * this.defaultInterestRate);
    const totalRepayable = amount + interestAmount;

    return {
      ...nation,
      treasury: nation.treasury + amount,
      nationalDebt: nation.nationalDebt + totalRepayable,
    };
  }
}
