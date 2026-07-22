import type { Nation } from "@/core/types/nation.types";

export interface FinancialUpdateResult {
  netIncome: number;
  newTreasury: number;
  newDebt: number;
  interestPaid: number;
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

    if (debt > 0) {
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

    return {
      netIncome,
      newTreasury: treasury,
      newDebt: debt,
      interestPaid,
    };
  }
}
