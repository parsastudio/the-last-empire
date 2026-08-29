import {
  Nation,
  Province,
  NationGettersUtility,
  getNationGdp,
} from "@geopolitics/domain";

export interface NationOverviewViewModel {
  id: string;
  name: string;
  flagCode: string;
  governmentType: string;
  rank: number;
  gdp: number;
  population: number;
  maxPopulationCapacity: number;
  perCapitaProductivity: number;
  territoryPixelCount: number;
  infrastructureLevel: number;
  treasury: number;
  nationalDebt: number;
  stability: number;
  globalReputation: number;
  economicStance: Nation["economicStance"];
}

export function selectNationOverviewViewModel(
  nation: Nation,
  nationsMap?: Record<string, Nation>,
  provincesMap?: Record<string, Province>,
): NationOverviewViewModel {
  return {
    id: nation.id,
    name: nation.name,
    flagCode: nation.flagCode,
    governmentType: nation.government.type,
    rank: NationGettersUtility.getRank(nation.id, nationsMap, provincesMap),
    gdp: getNationGdp(nation, provincesMap),
    population: NationGettersUtility.getPopulation(nation.id, provincesMap),
    maxPopulationCapacity: NationGettersUtility.getMaxPopulationCapacity(
      nation.id,
      provincesMap,
    ),
    perCapitaProductivity: NationGettersUtility.getPerCapitaProductivity(
      nation.id,
      provincesMap,
    ),
    territoryPixelCount: NationGettersUtility.getTerritoryPixelCount(
      nation.id,
      provincesMap,
    ),
    infrastructureLevel: NationGettersUtility.getInfrastructureLevel(
      nation.id,
      provincesMap,
    ),
    treasury: nation.treasury,
    nationalDebt: nation.nationalDebt,
    stability: nation.government.stability,
    globalReputation: nation.globalReputation,
    economicStance: nation.economicStance,
  };
}
