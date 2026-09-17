import {
  Nation,
  Province,
  getNationGdp,
  DebtCalculatorUtility,
  IndustryCalculator,
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
    const updatedProvinces = provinces.map((p) => {
      const nextFactoriesCount = Math.max(
        1,
        Math.floor(p.factoriesCount * 0.75),
      );
      const nextTiers = p.factoryTiers
        ? p.factoryTiers.map((t) => ({
            ...t,
            count: Math.max(0, Math.floor(t.count * 0.75)),
          }))
        : [];

      return {
        ...p,
        factoriesCount: nextFactoriesCount,
        factoryTiers: nextTiers,
      };
    });

    const updatedNationTiers = nation.factoryTiers
      ? nation.factoryTiers.map((t) => ({
          ...t,
          count: Math.max(0, Math.floor(t.count * 0.75)),
        }))
      : [];

    const updatedEquipmentTech =
      IndustryCalculator.calculateWeightedAverageTech(
        updatedNationTiers,
        nation.industrialLevel,
      );

    const updatedNation: Nation = {
      ...nation,
      treasury: 0,
      nationalDebt: 0,
      factoryTiers: updatedNationTiers,
      equipmentTechLevel: updatedEquipmentTech,
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
