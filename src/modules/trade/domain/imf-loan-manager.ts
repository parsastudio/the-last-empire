import type { Nation } from "@/core/types/nation.types";
import type { ImfLoan } from "@/core/types/trade.types";
import { GameError } from "@/core/errors/game-error";

export class ImfLoanManager {
  private readonly defaultInterestRate = 0.05;
  private readonly defaultDuration = 20;

  public requestImfLoan(nation: Nation, amount: number): Nation {
    if (amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Loan request amount must be positive",
      );
    }

    const interestAmount = Math.floor(amount * this.defaultInterestRate);
    const totalRepayable = amount + interestAmount;

    const newLoan: ImfLoan = {
      id: `imf-loan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      principalAmount: amount,
      interestRate: this.defaultInterestRate,
      turnsRemaining: this.defaultDuration,
      totalRepayable,
    };

    return {
      ...nation,
      treasury: nation.treasury + amount,
      debt: nation.debt + totalRepayable,
      imfLoans: [...nation.imfLoans, newLoan],
    };
  }
}
