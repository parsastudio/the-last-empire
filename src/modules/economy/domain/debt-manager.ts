import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface FinancialUpdateResult {
  netIncome: number;
  newTreasury: number;
  newDebt: number;
  interestPaid: number;
  updatedNation: Nation;
}

export class DebtManager {
  private readonly interestRate = 0.015;

  public processFinancials(
    nation: Nation,
    totalIncome: number,
    totalUpkeep: number,
  ): FinancialUpdateResult {
    let netIncome = totalIncome - totalUpkeep;
    const interestPaid = Math.floor(nation.nationalDebt * this.interestRate);
    netIncome -= interestPaid;

    let treasury = nation.treasury + netIncome;
    let nationalDebt = nation.nationalDebt;

    if (treasury < 0) {
      nationalDebt += Math.abs(treasury);
      treasury = 0;
    }

    const updatedNation: Nation = {
      ...nation,
      treasury,
      nationalDebt,
    };

    return {
      netIncome,
      newTreasury: treasury,
      newDebt: nationalDebt,
      interestPaid,
      updatedNation,
    };
  }
}
