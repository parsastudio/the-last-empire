import { Nation } from "@/domain/nation/nation.schema";

export class BankruptcyManager {
  public isBankrupt(nation: Nation): boolean {
    if (nation.gdp <= 0) return nation.nationalDebt > 0;
    return nation.nationalDebt / nation.gdp >= 1.0;
  }

  public applyBankruptcy(nation: Nation): Nation {
    return {
      ...nation,
      treasury: 0,
      nationalDebt: 0,
      gdp: Math.floor(nation.gdp * 0.75),
    };
  }
}
