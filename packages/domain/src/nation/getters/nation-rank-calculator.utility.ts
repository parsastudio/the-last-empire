import { CountryRegistry } from "@/domain/data/countries";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationTerritoryResolverUtility } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";
import {
  NationRankCandidateInput,
  NationPowerScoreEvaluator,
} from "@/domain/nation/getters/rank/nation-power-score-evaluator";

export type { NationRankCandidateInput };

interface RankedCandidate {
  id: string;
  canonicalId: string;
  powerScore: number;
  gdp: number;
}

export class NationRankCalculatorUtility {
  public static calculateRankMapFromCandidates(
    candidatesInput: NationRankCandidateInput[],
  ): Map<string, number> {
    const rankMap = new Map<string, number>();
    const count = candidatesInput.length;
    if (count === 0) return rankMap;

    const rankedList: RankedCandidate[] = new Array(count);

    for (let i = 0; i < count; i++) {
      const input = candidatesInput[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(input.id);
      const powerScore = NationPowerScoreEvaluator.calculatePowerScore(input);

      rankedList[i] = {
        id: input.id,
        canonicalId,
        powerScore,
        gdp: input.gdp,
      };
    }

    rankedList.sort((a, b) => {
      if (b.powerScore !== a.powerScore) {
        return b.powerScore - a.powerScore;
      }
      if (b.gdp !== a.gdp) {
        return b.gdp - a.gdp;
      }
      return a.canonicalId.localeCompare(b.canonicalId);
    });

    for (let i = 0; i < count; i++) {
      const item = rankedList[i]!;
      const rankValue = i + 1;
      rankMap.set(item.canonicalId, rankValue);
      rankMap.set(item.id, rankValue);
    }

    return rankMap;
  }

  public static calculateRankMap(
    nationsMap?: Record<string, Nation>,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): Map<string, number> {
    if (!nationsMap) return new Map<string, number>();

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);
    if (aliveNations.length === 0) return new Map<string, number>();

    const ownerMap =
      provincesByOwnerMap ??
      NationTerritoryResolverUtility.buildProvincesByOwnerMap(provincesMap);

    const candidatesInput: NationRankCandidateInput[] = new Array(
      aliveNations.length,
    );

    for (let i = 0; i < aliveNations.length; i++) {
      const nation = aliveNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const provList =
        ownerMap.get(canonicalId) ?? ownerMap.get(nation.id) ?? [];

      let gdp = 0;
      let population = 0;
      for (let p = 0; p < provList.length; p++) {
        const prov = provList[p]!;
        gdp += getProvinceGdp(prov, nation.equipmentTechLevel ?? 1.0);
        population += MapTopologyRegistry.getPopulation(prov.provinceId, 0);
      }

      candidatesInput[i] = {
        id: nation.id,
        gdp,
        population,
        military: nation.military,
        navalFleet: nation.navalFleet,
        stability: nation.government.stability,
        globalReputation: nation.globalReputation,
      };
    }

    return this.calculateRankMapFromCandidates(candidatesInput);
  }

  public static calculateGdpRankMap(
    nationsMap?: Record<string, Nation>,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): Map<string, number> {
    const gdpRankMap = new Map<string, number>();
    if (!nationsMap) return gdpRankMap;

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);
    if (aliveNations.length === 0) return gdpRankMap;

    const ownerMap =
      provincesByOwnerMap ??
      NationTerritoryResolverUtility.buildProvincesByOwnerMap(provincesMap);

    const candidateList = aliveNations.map((nation) => {
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const provList =
        ownerMap.get(canonicalId) ?? ownerMap.get(nation.id) ?? [];

      let gdp = 0;
      for (let p = 0; p < provList.length; p++) {
        const prov = provList[p]!;
        gdp += getProvinceGdp(prov, nation.equipmentTechLevel ?? 1.0);
      }

      return {
        id: nation.id,
        canonicalId,
        gdp,
      };
    });

    candidateList.sort((a, b) => {
      if (b.gdp !== a.gdp) {
        return b.gdp - a.gdp;
      }
      return a.canonicalId.localeCompare(b.canonicalId);
    });

    for (let i = 0; i < candidateList.length; i++) {
      const item = candidateList[i]!;
      const rankValue = i + 1;
      gdpRankMap.set(item.canonicalId, rankValue);
      gdpRankMap.set(item.id, rankValue);
    }

    return gdpRankMap;
  }

  public static getRank(
    nationId: string,
    allNations?: Record<string, Nation>,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    rankMap?: Map<string, number>,
  ): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (rankMap) {
      return rankMap.get(canonicalId) ?? rankMap.get(nationId) ?? 99;
    }
    const map = this.calculateRankMap(allNations, provincesMap);
    return map.get(canonicalId) ?? map.get(nationId) ?? 99;
  }

  public static getGdpRank(
    nationId: string,
    allNations?: Record<string, Nation>,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    gdpRankMap?: Map<string, number>,
  ): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (gdpRankMap) {
      return gdpRankMap.get(canonicalId) ?? gdpRankMap.get(nationId) ?? 99;
    }
    const map = this.calculateGdpRankMap(allNations, provincesMap);
    return map.get(canonicalId) ?? map.get(nationId) ?? 99;
  }
}
