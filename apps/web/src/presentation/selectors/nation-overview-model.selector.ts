import {
  Nation,
  Province,
  NationGettersUtility,
  getNationGdp,
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
  const capacity = NationGettersUtility.getTerritoryIndustrialCapacity(
    nation.id,
    provincesMap,
  );

  const gdp = getNationGdp(nation, provincesMap);
  const availableLoanLimit = DebtCalculatorUtility.getAvailableLoanHeadroom(
    nation.nationalDebt,
    gdp,
  );
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
    totalActiveFactories: capacity.totalActiveFactories,
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
