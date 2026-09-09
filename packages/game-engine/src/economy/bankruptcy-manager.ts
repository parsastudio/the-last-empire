import {
  Nation,
  Province,
  getNationGdp,
  DebtCalculatorUtility,
} from "@geopolitics/domain";

export class BankruptcyManager {
  public isBankrupt(
    nation: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    const gdp = getNationGdp(nation, provincesMap);
    if (gdp <= 0) return nation.nationalDebt > 0;
    return nation.nationalDebt >= DebtCalculatorUtility.getBankruptcyLimit(gdp);
  }

  public applyBankruptcy(
    nation: Nation,
    provinces: Province[],
  ): {
    updatedNation: Nation;
    updatedProvinces: Province[];
  } {
    const updatedProvinces = provinces.map((p) => ({
      ...p,
      factoriesCount: Math.max(1, Math.floor(p.factoriesCount * 0.75)),
    }));

    const updatedNation: Nation = {
      ...nation,
      treasury: 0,
      nationalDebt: 0,
      government: {
        ...nation.government,
        stability: Math.max(0, nation.government.stability - 20),
      },
    };

    return {
      updatedNation,
      updatedProvinces,
    };
  }
}
