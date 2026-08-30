import {
  Nation,
  Province,
  NationGettersUtility,
  getNationGdp,
  CountryRegistry,
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
  totalMaxSlots: number;
  territoryPixelCount: number;
  industrialLevel: number;
  equipmentTechLevel: number;
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
  const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
  let totalActiveFactories = 0;
  let totalMaxSlots = 0;

  if (provincesMap) {
    for (const p of Object.values(provincesMap)) {
      if (CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId) {
        totalActiveFactories += p.factoriesCount;
        totalMaxSlots += p.maxSlots;
      }
    }
  }

  return {
    id: nation.id,
    name: nation.name,
    flagCode: nation.flagCode,
    governmentType: nation.government.type,
    rank: NationGettersUtility.getRank(nation.id, nationsMap, provincesMap),
    gdp: getNationGdp(nation, provincesMap),
    population: NationGettersUtility.getPopulation(nation.id, provincesMap),
    totalActiveFactories,
    totalMaxSlots,
    territoryPixelCount: NationGettersUtility.getTerritoryPixelCount(
      nation.id,
      provincesMap,
    ),
    industrialLevel: nation.industrialLevel,
    equipmentTechLevel: nation.equipmentTechLevel,
    treasury: nation.treasury,
    nationalDebt: nation.nationalDebt,
    stability: nation.government.stability,
    globalReputation: nation.globalReputation,
    economicStance: nation.economicStance,
  };
}
