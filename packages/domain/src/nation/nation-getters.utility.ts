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
    if (aliveNations.length === 0) return rankMap;

    const nationMetrics = aliveNations.map((nation) => {
      const provs = NationGettersUtility.getOwnedProvinces(
        nation.id,
        provincesMap,
      );
      const gdp = provs.reduce((sum, p) => sum + getProvinceGdp(p), 0);
      const milPower = MilitaryPowerCalculator.calculateEffectivePower(
        nation,
        true,
      );
      const population = provs.reduce((sum, p) => sum + (p.population || 0), 0);

      return {
        nation,
        gdp,
        milPower,
        population,
      };
    });

    let maxGdp = 0;
    let maxMilPower = 0;

    for (const item of nationMetrics) {
      if (item.gdp > maxGdp) maxGdp = item.gdp;
      if (item.milPower > maxMilPower) maxMilPower = item.milPower;
    }

    const safeMaxGdp = Math.max(1, maxGdp);
    const safeMaxMil = Math.max(1, maxMilPower);

    const scoredNations = nationMetrics.map((item) => {
      const normGdp = (item.gdp / safeMaxGdp) * 100;
      const normMil = (item.milPower / safeMaxMil) * 100;
      const compositeScore = normGdp * 0.7 + normMil * 0.3;

      return {
        ...item,
        compositeScore,
      };
    });

    scoredNations.sort((a, b) => {
      if (Math.abs(b.compositeScore - a.compositeScore) > 0.0001) {
        return b.compositeScore - a.compositeScore;
      }
      if (b.population !== a.population) {
        return b.population - a.population;
      }
      return a.nation.id.localeCompare(b.nation.id);
    });

    for (let i = 0; i < scoredNations.length; i++) {
      const item = scoredNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(item.nation.id);
      rankMap.set(canonicalId, i + 1);
      rankMap.set(item.nation.id, i + 1);
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
