import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { DebtCalculatorUtility } from "@geopolitics/domain";

export class DebtCalculator {
  public static calculateBorrowingCapacity(
    nation: Nation,
    provincesMap?: Record<string, Province>,
  ): number {
    const gdp = getNationGdp(nation, provincesMap);
    const maxCapacity = DebtCalculatorUtility.getMaxDebtLimit(gdp);
    return Math.max(0, maxCapacity - nation.nationalDebt);
  }

  public static calculateInterest(debt: number): number {
    return DebtCalculatorUtility.calculateInterest(debt);
  }
}

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
        stability: Math.max(10, nation.government.stability - 25),
      },
    };

    return {
      updatedNation,
      updatedProvinces,
    };
  }
}
