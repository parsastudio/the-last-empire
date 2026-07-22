import { Resources } from "./resources.types";

export interface EconomyStats {
  baseGdp: number;
  gdpGrowth: number;
  gdpLossFromCorruption: number;
  netIncome: number;
  totalTaxRevenue: number;
  totalUpkeepCost: number;
  debtInterestPaid: number;
}

export interface TreasuryTransaction {
  id: string;
  type:
    | "TAX_INCOME"
    | "UPKEEP_EXPENSE"
    | "TRADE_REVENUE"
    | "LOAN_REPAYMENT"
    | "LOAN_ISSUED"
    | "MILITARY_SPENDING"
    | "INFRASTRUCTURE_SPENDING"
    | "TRIBUTE_PAYMENT"
    | "TRIBUTE_INCOME";
  amount: number;
  turn: number;
}
