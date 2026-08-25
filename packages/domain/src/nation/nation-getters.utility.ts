import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { MilitaryDistributionEngine } from "@/domain/military/military-distribution-engine";
import { MilitaryStack } from "@/domain/military/military.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";

export interface NationRankCandidateInput {
  id: string;
  name?: string;
  gdp: number;
  population?: number;
  military?: MilitaryStack;
  governmentType?: GovernmentType | string;
  militaryTier?: number;
  startingTechLevel?: number;
  hasSeaAccess?: boolean;
}

interface ProcessedCandidate {
  id: string;
  canonicalId: string;
  gdp: number;
  milPower: number;
  population: number;
  ecoRank: number;
  milRank: number;
  compositeScore: number;
}

export class NationGettersUtility {
  public static calculateRankMapFromCandidates(
    candidatesInput: NationRankCandidateInput[],
  ): Map<string, number> {
    const rankMap = new Map<string, number>();
    if (candidatesInput.length === 0) return rankMap;

    const processed: ProcessedCandidate[] = new Array(candidatesInput.length);

    for (let i = 0; i < candidatesInput.length; i++) {
      const input = candidatesInput[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(input.id);
      const profile =
        CountryRegistry.getCountry(canonicalId) ||
        CountryRegistry.getCountry(input.id);

      let milPower = 0;

      if (input.military) {
        milPower = MilitaryPowerCalculator.calculateEffectivePower(
          {
            id: canonicalId,
            name: input.name || profile?.nameFa || canonicalId,
            isAi: true,
            isAlive: true,
            flagCode: profile?.flagCode || "IR",
            taxRate: 15,
            tariffRate: 10,
            treasury: 100000,
            nationalDebt: 0,
            industrialLevel: 1,
            government: {
              type:
                (input.governmentType as GovernmentType) ||
                profile?.startingGovernment ||
                "DEMOCRACY",
              stability: 50,
              turnsInPower: 1,
            },
            military: input.military,
            recruitmentQueue: [],
            relations: {},
            activeModifiers: [],
            globalReputation: 50,
            executedEspionageTiers: [],
            warFocusTargetId: null,
          },
          true,
        );
      } else {
        const tier = input.militaryTier ?? profile?.militaryTier ?? 5;
        const techLevel =
          input.startingTechLevel ?? profile?.startingTechLevel ?? 1;
        const hasSea = input.hasSeaAccess ?? true;
        const stack = MilitaryDistributionEngine.calculateStartingStack(
          tier,
          hasSea,
          techLevel,
        );

        milPower = MilitaryPowerCalculator.calculateEffectivePower(
          {
            id: canonicalId,
            name: input.name || profile?.nameFa || canonicalId,
            isAi: true,
            isAlive: true,
            flagCode: profile?.flagCode || "IR",
            taxRate: 15,
            tariffRate: 10,
            treasury: 100000,
            nationalDebt: 0,
            industrialLevel: 1,
            government: {
              type:
                (input.governmentType as GovernmentType) ||
                profile?.startingGovernment ||
                "DEMOCRACY",
              stability: 50,
              turnsInPower: 1,
            },
            military: stack,
            recruitmentQueue: [],
            relations: {},
            activeModifiers: [],
            globalReputation: 50,
            executedEspionageTiers: [],
            warFocusTargetId: null,
          },
          true,
        );
      }

      processed[i] = {
        id: input.id,
        canonicalId,
        gdp: input.gdp,
        milPower,
        population: input.population || profile?.population || 0,
        ecoRank: 1,
        milRank: 1,
        compositeScore: 0,
      };
    }

    const ecoSorted = [...processed].sort((a, b) => {
      if (b.gdp !== a.gdp) return b.gdp - a.gdp;
      if (b.population !== a.population) return b.population - a.population;
      return a.canonicalId.localeCompare(b.canonicalId);
    });
    for (let i = 0; i < ecoSorted.length; i++) {
      ecoSorted[i]!.ecoRank = i + 1;
    }

    const milSorted = [...processed].sort((a, b) => {
      if (b.milPower !== a.milPower) return b.milPower - a.milPower;
      if (b.gdp !== a.gdp) return b.gdp - a.gdp;
      return a.canonicalId.localeCompare(b.canonicalId);
    });
    for (let i = 0; i < milSorted.length; i++) {
      milSorted[i]!.milRank = i + 1;
    }

    for (let i = 0; i < processed.length; i++) {
      const c = processed[i]!;
      c.compositeScore = c.ecoRank * 3 + c.milRank * 1;
    }

    processed.sort((a, b) => {
      if (a.compositeScore !== b.compositeScore) {
        return a.compositeScore - b.compositeScore;
      }
      if (b.gdp !== a.gdp) return b.gdp - a.gdp;
      if (b.population !== a.population) return b.population - a.population;
      return a.canonicalId.localeCompare(b.canonicalId);
    });

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i]!;
      const rankValue = i + 1;
      rankMap.set(item.canonicalId, rankValue);
      rankMap.set(item.id, rankValue);
    }

    return rankMap;
  }

  public static buildProvincesByOwnerMap(
    provincesMap?: Record<string, Province> | Province[],
  ): Map<string, Province[]> {
    const map = new Map<string, Province[]>();
    if (!provincesMap) return map;

    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);

    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      const cid = CountryRegistry.resolveCanonicalId(p.ownerNationId);
      let group = map.get(cid);
      if (!group) {
        group = [];
        map.set(cid, group);
      }
      group.push(p);
    }

    return map;
  }

  public static getOwnedProvinces(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Province[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (provincesByOwnerMap) {
      return (
        provincesByOwnerMap.get(canonicalId) ??
        provincesByOwnerMap.get(nationId) ??
        []
      );
    }
    if (!provincesMap) return [];
    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);
    return list.filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId,
    );
  }

  public static getPopulation(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += provs[i]!.population || 0;
    }
    return total;
  }

  public static getMaxPopulationCapacity(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += provs[i]!.maxPopulationCapacity || 0;
    }
    return total;
  }

  public static getPerCapitaProductivity(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    if (provs.length === 0) return 5000;

    let totalPop = 0;
    let totalProdWeighted = 0;

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      const pop = p.population || 0;
      totalPop += pop;
      totalProdWeighted += pop * (p.perCapitaProductivity || 5000);
    }

    if (totalPop <= 0) return 5000;
    return Math.round(totalProdWeighted / totalPop);
  }

  public static getInfrastructureLevel(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const prod = this.getPerCapitaProductivity(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
    );
    if (prod <= 5000) return 1;
    const ratio = prod / 5000;
    const level = Math.floor(Math.log(ratio + 1e-6) / Math.log(1.05)) + 1;
    return Math.max(1, level);
  }

  public static getTerritoryPixelCount(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += provs[i]!.pixelCount || 0;
    }
    return total;
  }

  public static hasSeaAccess(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    for (let i = 0; i < provs.length; i++) {
      if (provs[i]!.hasSeaAccess) return true;
    }
    return false;
  }

  public static isAlive(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      if ((p.pixelCount || 0) > 0 && (p.population || 0) > 0) return true;
    }
    return false;
  }

  public static calculateRankMap(
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Map<string, number> {
    if (!nationsMap) return new Map<string, number>();

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);
    if (aliveNations.length === 0) return new Map<string, number>();

    const ownerMap =
      provincesByOwnerMap ?? this.buildProvincesByOwnerMap(provincesMap);

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
        gdp += getProvinceGdp(prov);
        population += prov.population || 0;
      }

      candidatesInput[i] = {
        id: nation.id,
        name: nation.name,
        gdp,
        population,
        military: nation.military,
        governmentType: nation.government.type,
      };
    }

    return this.calculateRankMapFromCandidates(candidatesInput);
  }

  public static getRank(
    nationId: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
    rankMap?: Map<string, number>,
  ): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (rankMap) {
      return rankMap.get(canonicalId) ?? rankMap.get(nationId) ?? 99;
    }
    const map = this.calculateRankMap(nationsMap, provincesMap);
    return map.get(canonicalId) ?? map.get(nationId) ?? 99;
  }
}
