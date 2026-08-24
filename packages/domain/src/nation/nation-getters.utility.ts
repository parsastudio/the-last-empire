import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";

export class NationGettersUtility {
  public static getOwnedProvinces(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): Province[] {
    if (!provincesMap) return [];
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
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
  ): number {
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    return provs.reduce((sum, p) => sum + (p.population || 0), 0);
  }

  public static getMaxPopulationCapacity(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): number {
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    return provs.reduce((sum, p) => sum + (p.maxPopulationCapacity || 0), 0);
  }

  public static getPerCapitaProductivity(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): number {
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    const totalPop = provs.reduce((sum, p) => sum + (p.population || 0), 0);
    if (totalPop <= 0) return 5000;
    const totalProductivity = provs.reduce(
      (sum, p) => sum + (p.population || 0) * (p.perCapitaProductivity || 5000),
      0,
    );
    return Math.round(totalProductivity / totalPop);
  }

  public static getTerritoryPixelCount(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): number {
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    return provs.reduce((sum, p) => sum + (p.pixelCount || 0), 0);
  }

  public static hasSeaAccess(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): boolean {
    if (!provincesMap) return false;
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);

    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      if (
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId &&
        p.hasSeaAccess
      ) {
        return true;
      }
    }
    return false;
  }

  public static getInfrastructureLevel(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): number {
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    if (provs.length === 0) return 1;
    return Math.max(1, ...provs.map((p) => p.infrastructureLevel || 1));
  }

  public static isAlive(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
  ): boolean {
    if (!provincesMap) return false;
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);

    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      if (
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId &&
        (p.pixelCount || 0) > 0 &&
        (p.population || 0) > 0
      ) {
        return true;
      }
    }
    return false;
  }

  public static calculateRankMap(
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
  ): Map<string, number> {
    const rankMap = new Map<string, number>();
    if (!nationsMap) return rankMap;

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);
    if (aliveNations.length === 0) return rankMap;

    const gdpByNation = new Map<string, number>();
    const popByNation = new Map<string, number>();

    if (provincesMap) {
      const provList = Array.isArray(provincesMap)
        ? provincesMap
        : Object.values(provincesMap);

      for (let i = 0; i < provList.length; i++) {
        const p = provList[i]!;
        const cid = CountryRegistry.resolveCanonicalId(p.ownerNationId);
        const provGdp = getProvinceGdp(p);
        gdpByNation.set(cid, (gdpByNation.get(cid) || 0) + provGdp);
        popByNation.set(cid, (popByNation.get(cid) || 0) + (p.population || 0));
      }
    }

    const nationMetrics = new Array(aliveNations.length);
    let maxGdp = 0;
    let maxMilPower = 0;

    for (let i = 0; i < aliveNations.length; i++) {
      const nation = aliveNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const gdp =
        gdpByNation.get(canonicalId) || gdpByNation.get(nation.id) || 0;
      const milPower = MilitaryPowerCalculator.calculateEffectivePower(
        nation,
        true,
      );
      const population =
        popByNation.get(canonicalId) || popByNation.get(nation.id) || 0;

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
