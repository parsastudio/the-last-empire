import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface FinancialUpdateResult {
  netIncome: number;
  newTreasury: number;
  newDebt: number;
  interestPaid: number;
  updatedNation: Nation;
}

export class DebtManager {
  private readonly interestRate = 0.05;

  public processFinancials(
    nation: Nation,
    totalIncome: number,
    totalUpkeep: number,
  ): FinancialUpdateResult {
    const netIncome = totalIncome - totalUpkeep;
    let treasury = nation.treasury + netIncome;
    let debt = nation.debt;
    let interestPaid = 0;

    const remainingLoans = [];
    for (const loan of nation.imfLoans) {
      const basePayment = Math.ceil(loan.principalAmount / 20);
      const loanInterest = Math.ceil(
        loan.totalRepayable * (loan.interestRate / loan.turnsRemaining),
      );
      const totalLoanDue = basePayment + loanInterest;

      if (treasury >= totalLoanDue) {
        treasury -= totalLoanDue;
        interestPaid += loanInterest;
        debt = Math.max(0, debt - totalLoanDue);

        const nextTurns = loan.turnsRemaining - 1;
        if (nextTurns > 0) {
          remainingLoans.push({
            ...loan,
            turnsRemaining: nextTurns,
            totalRepayable: Math.max(0, loan.totalRepayable - totalLoanDue),
          });
        }
      } else {
        remainingLoans.push(loan);
      }
    }

    if (debt > 0 && interestPaid === 0) {
      interestPaid = Math.floor(debt * this.interestRate);
      treasury -= interestPaid;
    }

    if (treasury < 0) {
      debt += Math.abs(treasury);
      treasury = 0;
    } else if (debt > 0 && treasury > 0) {
      const repayment = Math.min(treasury, debt);
      debt -= repayment;
      treasury -= repayment;
    }

    const updatedNation: Nation = {
      ...nation,
      imfLoans: remainingLoans,
      treasury,
      debt,
    };

    return {
      netIncome,
      newTreasury: treasury,
      newDebt: debt,
      interestPaid,
      updatedNation,
    };
  }
}
