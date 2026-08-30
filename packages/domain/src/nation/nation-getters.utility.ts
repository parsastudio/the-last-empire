import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import {
  NationRankCandidateInput,
  NationRankCalculatorUtility,
} from "@/domain/nation/getters/nation-rank-calculator.utility";
import { NationTerritoryResolverUtility } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationDemographicsResolverUtility } from "@/domain/nation/getters/nation-demographics-resolver.utility";

export type { NationRankCandidateInput };

export class NationGettersUtility {
  public static resolveNation(
    identifier: unknown,
    nationsMap?: Record<string, Nation>,
  ): Nation | null {
    if (!nationsMap || identifier === null || identifier === undefined) {
      return null;
    }
    const canonical = CountryRegistry.resolveCanonicalId(identifier);
    const rawKey =
      typeof identifier === "string" ? identifier : String(identifier);
    return nationsMap[canonical] || nationsMap[rawKey] || null;
  }

  public static calculateRankMapFromCandidates =
    NationRankCalculatorUtility.calculateRankMapFromCandidates.bind(
      NationRankCalculatorUtility,
    );
  public static calculateRankMap =
    NationRankCalculatorUtility.calculateRankMap.bind(
      NationRankCalculatorUtility,
    );
  public static getRank = NationRankCalculatorUtility.getRank.bind(
    NationRankCalculatorUtility,
  );

  public static buildProvincesByOwnerMap =
    NationTerritoryResolverUtility.buildProvincesByOwnerMap.bind(
      NationTerritoryResolverUtility,
    );
  public static getOwnedProvinces =
    NationTerritoryResolverUtility.getOwnedProvinces.bind(
      NationTerritoryResolverUtility,
    );
  public static getTerritoryPixelCount =
    NationTerritoryResolverUtility.getTerritoryPixelCount.bind(
      NationTerritoryResolverUtility,
    );
  public static hasSeaAccess = NationTerritoryResolverUtility.hasSeaAccess.bind(
    NationTerritoryResolverUtility,
  );
  public static isAlive = NationTerritoryResolverUtility.isAlive.bind(
    NationTerritoryResolverUtility,
  );

  public static getPopulation =
    NationDemographicsResolverUtility.getPopulation.bind(
      NationDemographicsResolverUtility,
    );
  public static getMaxPopulationCapacity =
    NationDemographicsResolverUtility.getMaxPopulationCapacity.bind(
      NationDemographicsResolverUtility,
    );
  public static getPerCapitaProductivity =
    NationDemographicsResolverUtility.getPerCapitaProductivity.bind(
      NationDemographicsResolverUtility,
    );

  public static getInfrastructureLevel(
    nationOrId: Nation | string,
    _provincesMap?: Record<string, Province> | Province[] | unknown,
  ): number {
    if (
      typeof nationOrId === "object" &&
      nationOrId !== null &&
      "industrialLevel" in nationOrId
    ) {
      return nationOrId.industrialLevel || 1;
    }
    return 1;
  }
}
