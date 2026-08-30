import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationRankCalculatorUtility } from "@/domain/nation/getters/nation-rank-calculator.utility";
import { NationTerritoryResolverUtility } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationRankCandidateInput } from "@/domain/nation/getters/rank/nation-power-score-evaluator";

export class NationGettersUtility {
  public static resolveNation(
    targetIdentifier: string,
    allNations?: Record<string, Nation>,
  ): Nation | null {
    return NationTerritoryResolverUtility.resolveNation(
      targetIdentifier,
      allNations,
    );
  }

  public static getOwnedProvinces(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Province[] {
    return NationTerritoryResolverUtility.getOwnedProvinces(
      nationId,
      provincesMap,
      provincesByOwnerMap,
    );
  }

  public static getTerritoryPixelCount(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    return NationTerritoryResolverUtility.getTerritoryPixelCount(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
    );
  }

  public static hasSeaAccess(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    return NationTerritoryResolverUtility.hasSeaAccess(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
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

  public static getRank(
    nationId: string,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
  ): number {
    return NationRankCalculatorUtility.getRank(
      nationId,
      allNations,
      provincesMap,
      rankMap,
    );
  }

  public static calculateGlobalRankMap(
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Map<string, number> {
    return NationRankCalculatorUtility.calculateGlobalRankMap(
      allNations,
      provincesMap,
    );
  }

  public static calculateRankMapFromCandidates(
    candidates: NationRankCandidateInput[],
  ): Map<string, number> {
    return NationRankCalculatorUtility.calculateRankMapFromCandidates(
      candidates,
    );
  }
}
