import {
  Nation,
  Province,
  NationGettersUtility,
  getNationGdp,
  CountryRegistry,
  DebtCalculatorUtility,
} from "@geopolitics/domain";

export interface NationOverviewViewModel {
  id: string;
  name: string;
  flagCode: string;
  governmentType: string;
  rank: number;
  gdp: number;
  population: number;
  totalActiveFactories: number;
  militaryTechLevel: number;
  industrialLevel: number;
  treasury: number;
  nationalDebt: number;
  availableLoanLimit: number;
  debtInterestPerTurn: number;
  stability: number;
  globalReputation: number;
}

export function selectNationOverviewViewModel(
  nation: Nation,
  nationsMap?: Record<string, Nation>,
  provincesMap?: Record<string, Province>,
): NationOverviewViewModel {
  const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
  let totalActiveFactories = 0;

  if (provincesMap) {
    for (const p of Object.values(provincesMap)) {
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalActiveFactories += p.factoriesCount;
      }
    }
  }

  const gdp = getNationGdp(nation, provincesMap);
  const maxDebt = DebtCalculatorUtility.getMaxDebtLimit(gdp);
  const availableLoanLimit = Math.max(0, maxDebt - nation.nationalDebt);
  const debtInterestPerTurn = DebtCalculatorUtility.calculateInterest(
    nation.nationalDebt,
  );

  return {
    id: nation.id,
    name: nation.name,
    flagCode: nation.flagCode,
    governmentType: nation.government.type,
    rank: NationGettersUtility.getRank(nation.id, nationsMap, provincesMap),
    gdp,
    population: NationGettersUtility.getPopulation(nation.id, provincesMap),
    totalActiveFactories,
    militaryTechLevel: nation.military.techLevel,
    industrialLevel: nation.industrialLevel,
    treasury: nation.treasury,
    nationalDebt: nation.nationalDebt,
    availableLoanLimit,
    debtInterestPerTurn,
    stability: nation.government.stability,
    globalReputation: nation.globalReputation,
  };
}
