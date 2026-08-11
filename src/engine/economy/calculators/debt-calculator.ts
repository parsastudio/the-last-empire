import { Nation } from "@/domain/nation/nation.schema";

export class BankruptcyManager {
  public isBankrupt(nation: Nation): boolean {
    if (nation.gdp <= 0) return nation.nationalDebt > 0;
    return nation.nationalDebt / nation.gdp >= 1.0;
  }

  public applyBankruptcy(nation: Nation): Nation {
    const currentProd = nation.perCapitaProductivity || 5000;
    const reducedProd = Math.max(100, Math.floor(currentProd * 0.75));
    const reducedGdp = Math.floor(nation.population * reducedProd);

    return {
      ...nation,
      treasury: 0,
      nationalDebt: 0,
      perCapitaProductivity: reducedProd,
      gdp: reducedGdp,
    };
  }
}
