import { Province } from "@/domain/province/province.schema";
import { NationTerritoryResolverUtility } from "@/domain/nation/getters/nation-territory-resolver.utility";

export class NationDemographicsResolverUtility {
  public static getPopulation(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      NationTerritoryResolverUtility.getOwnedProvinces(
        nationId,
        provincesMap,
        provincesByOwnerMap,
      );

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
      NationTerritoryResolverUtility.getOwnedProvinces(
        nationId,
        provincesMap,
        provincesByOwnerMap,
      );

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
      NationTerritoryResolverUtility.getOwnedProvinces(
        nationId,
        provincesMap,
        provincesByOwnerMap,
      );

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
}
