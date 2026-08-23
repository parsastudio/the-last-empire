import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";

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
}
