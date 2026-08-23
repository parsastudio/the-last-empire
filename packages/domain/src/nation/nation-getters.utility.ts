import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";

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
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    return provs.some((p) => Boolean(p.hasSeaAccess));
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
    const provs = this.getOwnedProvinces(nationId, provincesMap);
    return (
      provs.length > 0 &&
      provs.some((p) => (p.pixelCount || 0) > 0 && (p.population || 0) > 0)
    );
  }

  public static calculateRankMap(
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
  ): Map<string, number> {
    const rankMap = new Map<string, number>();
    if (!nationsMap) return rankMap;

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);

    aliveNations.sort((a, b) => {
      const gdpA = NationGettersUtility.getOwnedProvinces(
        a.id,
        provincesMap,
      ).reduce((sum, p) => sum + getProvinceGdp(p), 0);
      const gdpB = NationGettersUtility.getOwnedProvinces(
        b.id,
        provincesMap,
      ).reduce((sum, p) => sum + getProvinceGdp(p), 0);

      if (gdpB !== gdpA) return gdpB - gdpA;

      const popA = NationGettersUtility.getPopulation(a.id, provincesMap);
      const popB = NationGettersUtility.getPopulation(b.id, provincesMap);
      if (popB !== popA) return popB - popA;

      return a.id.localeCompare(b.id);
    });

    for (let i = 0; i < aliveNations.length; i++) {
      const nation = aliveNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      rankMap.set(canonicalId, i + 1);
      rankMap.set(nation.id, i + 1);
    }

    return rankMap;
  }

  public static getRank(
    nationId: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
  ): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const map = this.calculateRankMap(nationsMap, provincesMap);
    return map.get(canonicalId) ?? map.get(nationId) ?? 99;
  }
}
