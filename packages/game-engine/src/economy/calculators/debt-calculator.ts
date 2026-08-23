import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class BankruptcyManager {
  public isBankrupt(
    nation: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    const gdp = getNationGdp(nation, provincesMap);
    if (gdp <= 0) return nation.nationalDebt > 0;
    return nation.nationalDebt / gdp >= 1.0;
  }

  public applyBankruptcy(
    nation: Nation,
    provinces: Province[],
  ): { updatedNation: Nation; updatedProvinces: Province[] } {
    const updatedProvinces = provinces.map((p) => ({
      ...p,
      perCapitaProductivity: Math.max(
        100,
        Math.floor((p.perCapitaProductivity || 5000) * 0.75),
      ),
    }));

    return {
      updatedNation: {
        ...nation,
        treasury: 0,
        nationalDebt: 0,
      },
      updatedProvinces,
    };
  }
}
