import {
  Nation,
  Province,
  NationGettersUtility,
  getNationGdp,
  DebtCalculatorUtility,
  GameStateProjections,
  CountryRegistry,
} from "@geopolitics/domain";

export interface NationOverviewViewModel {
  id: string;
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
  projections?: GameStateProjections | null,
): NationOverviewViewModel {
  const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);

  const capacity =
    projections?.capacityMap.get(canonicalId) ??
    NationGettersUtility.getTerritoryIndustrialCapacity(
      nation.id,
      provincesMap,
    );

  const gdp =
    projections?.gdpMap.get(canonicalId) ?? getNationGdp(nation, provincesMap);
  const population =
    projections?.populationMap.get(canonicalId) ??
    NationGettersUtility.getPopulation(nation.id, provincesMap);
  const rank =
    projections?.rankMap.get(canonicalId) ??
    NationGettersUtility.getRank(nation.id, nationsMap, provincesMap);

  const availableLoanLimit = DebtCalculatorUtility.getAvailableLoanHeadroom(
    nation.nationalDebt,
    gdp,
  );
  const debtInterestPerTurn = DebtCalculatorUtility.calculateInterest(
    nation.nationalDebt,
  );

  return {
    id: nation.id,
    flagCode: nation.flagCode,
    governmentType: nation.government.type,
    rank,
    gdp,
    population,
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
