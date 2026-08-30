import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { ProvinceDegradationUtility } from "@geopolitics/domain";

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
    const updatedProvinces =
      ProvinceDegradationUtility.degradeProvincesProductivity(provinces);

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
