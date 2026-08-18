import { Nation } from "@/domain/nation/nation.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class BankruptcyManager {
  public isBankrupt(nation: Nation): boolean {
    const gdp = getNationGdp(nation);
    if (gdp <= 0) return nation.nationalDebt > 0;
    return nation.nationalDebt / gdp >= 1.0;
  }

  public applyBankruptcy(nation: Nation): Nation {
    const currentProd = nation.perCapitaProductivity || 5000;
    const reducedProd = Math.max(100, Math.floor(currentProd * 0.75));

    return {
      ...nation,
      treasury: 0,
      nationalDebt: 0,
      perCapitaProductivity: reducedProd,
    };
  }
}
