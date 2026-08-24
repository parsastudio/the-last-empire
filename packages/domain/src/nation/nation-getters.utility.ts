import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";

export class NationGettersUtility {
  public static buildProvincesByOwnerMap(
    provincesMap?: Record<string, Province> | Province[],
  ): Map<string, Province[]> {
    const map = new Map<string, Province[]>();
    if (!provincesMap) return map;

    if (Array.isArray(provincesMap)) {
      for (let i = 0; i < provincesMap.length; i++) {
        const p = provincesMap[i]!;
        const cid = CountryRegistry.resolveCanonicalId(p.ownerNationId);
        let list = map.get(cid);
        if (!list) {
          list = [];
          map.set(cid, list);
        }
        list.push(p);
      }
    } else {
      for (const key in provincesMap) {
        const p = provincesMap[key]!;
        const cid = CountryRegistry.resolveCanonicalId(p.ownerNationId);
        let list = map.get(cid);
        if (!list) {
          list = [];
          map.set(cid, list);
        }
        list.push(p);
      }
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
    const result: Province[] = [];

    if (Array.isArray(provincesMap)) {
      for (let i = 0; i < provincesMap.length; i++) {
        const p = provincesMap[i]!;
        if (
          CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId
        ) {
          result.push(p);
        }
      }
    } else {
      for (const key in provincesMap) {
        const p = provincesMap[key]!;
        if (
          CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId
        ) {
          result.push(p);
        }
      }
    }

    return result;
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

  public static getInfrastructureLevel(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    if (provs.length === 0) return 1;
    let maxLevel = 1;
    for (let i = 0; i < provs.length; i++) {
      const lvl = provs[i]!.infrastructureLevel || 1;
      if (lvl > maxLevel) maxLevel = lvl;
    }
    return maxLevel;
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
    const rankMap = new Map<string, number>();
    if (!nationsMap) return rankMap;

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);
    if (aliveNations.length === 0) return rankMap;

    const ownerMap =
      provincesByOwnerMap ?? this.buildProvincesByOwnerMap(provincesMap);

    const nationMetrics = new Array(aliveNations.length);
    let maxGdp = 0;
    let maxMilPower = 0;

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

      const milPower = MilitaryPowerCalculator.calculateEffectivePower(
        nation,
        true,
      );

      if (gdp > maxGdp) maxGdp = gdp;
      if (milPower > maxMilPower) maxMilPower = milPower;

      nationMetrics[i] = {
        nation,
        gdp,
        milPower,
        population,
        compositeScore: 0,
      };
    }

    const safeMaxGdp = Math.max(1, maxGdp);
    const safeMaxMil = Math.max(1, maxMilPower);

    for (let i = 0; i < nationMetrics.length; i++) {
      const item = nationMetrics[i]!;
      const normGdp = (item.gdp / safeMaxGdp) * 100;
      const normMil = (item.milPower / safeMaxMil) * 100;
      item.compositeScore = normGdp * 0.7 + normMil * 0.3;
    }

    nationMetrics.sort((a, b) => {
      if (Math.abs(b.compositeScore - a.compositeScore) > 0.0001) {
        return b.compositeScore - a.compositeScore;
      }
      if (b.population !== a.population) {
        return b.population - a.population;
      }
      return a.nation.id.localeCompare(b.nation.id);
    });

    for (let i = 0; i < nationMetrics.length; i++) {
      const item = nationMetrics[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(item.nation.id);
      const rankValue = i + 1;
      rankMap.set(canonicalId, rankValue);
      rankMap.set(item.nation.id, rankValue);
    }

    return rankMap;
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
