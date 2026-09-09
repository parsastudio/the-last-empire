import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { FactoryBatch } from "@/domain/economy/factory-batch.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationRankCalculatorUtility } from "@/domain/nation/getters/nation-rank-calculator.utility";
import { NationTerritoryResolverUtility } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationRankCandidateInput } from "@/domain/nation/getters/rank/nation-power-score-evaluator";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export class NationGettersUtility {
  public static resolveNation(
    targetIdentifier: string,
    allNations?: Record<string, Nation>,
  ): Nation | null {
    if (!allNations) return null;
    const canonical = CountryRegistry.resolveCanonicalId(targetIdentifier);
    return allNations[canonical] || allNations[targetIdentifier] || null;
  }

  public static isAlive(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
  ): boolean {
    const provs =
      ownedProvinces ?? this.getOwnedProvinces(nationId, provincesMap);
    return provs.length > 0;
  }

  public static buildProvincesByOwnerMap(
    provinces: Record<string, Province> | Province[],
  ): Map<string, Province[]> {
    return NationTerritoryResolverUtility.buildProvincesByOwnerMap(provinces);
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

  public static getNationFactoryTiers(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): FactoryBatch[] {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    const allBatches: FactoryBatch[] = [];
    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      if (p.factoryTiers && p.factoryTiers.length > 0) {
        allBatches.push(...p.factoryTiers);
      } else if (p.factoriesCount > 0) {
        allBatches.push({ techLevel: 1.0, count: p.factoriesCount });
      }
    }

    return IndustryCalculator.consolidateBatches(allBatches);
  }

  public static getNationEquipmentTech(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    fallbackTech = 1.0,
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const batches = this.getNationFactoryTiers(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
    );
    return IndustryCalculator.calculateWeightedAverageTech(
      batches,
      fallbackTech,
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
      const p = provs[i]!;
      total +=
        p.population ?? MapTopologyRegistry.getPopulation(p.provinceId, 0);
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

  public static getGdpRank(
    nationId: string,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    gdpRankMap?: Map<string, number>,
  ): number {
    return NationRankCalculatorUtility.getGdpRank(
      nationId,
      allNations,
      provincesMap,
      gdpRankMap,
    );
  }

  public static calculateRankMap(
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Map<string, number> {
    return NationRankCalculatorUtility.calculateRankMap(
      allNations,
      provincesMap,
    );
  }

  public static calculateGdpRankMap(
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Map<string, number> {
    return NationRankCalculatorUtility.calculateGdpRankMap(
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
