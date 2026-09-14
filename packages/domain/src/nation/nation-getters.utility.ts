import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { FactoryBatch } from "@/domain/economy/factory-batch.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationRankCalculatorUtility } from "@/domain/nation/getters/nation-rank-calculator.utility";
import {
  NationTerritoryResolverUtility,
  TerritoryIndustrialCapacity,
} from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationRankCandidateInput } from "@/domain/nation/getters/rank/nation-power-score-evaluator";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export class NationGettersUtility {
  public static resolveNation(
    targetIdentifier: string,
    allNations?: Record<string, Nation>,
  ): Nation | null {
    if (!allNations || !targetIdentifier) return null;
    const canonical = CountryRegistry.resolveCanonicalId(targetIdentifier);
    return allNations[canonical] || allNations[targetIdentifier] || null;
  }

  public static getLiveDefenseGuarantors(
    nation: Nation,
    allNations?: Record<string, Nation>,
  ): Nation[] {
    if (
      !nation.defenseGuarantorIds ||
      nation.defenseGuarantorIds.length === 0 ||
      !allNations
    ) {
      return [];
    }

    const seen = new Set<string>();
    const guarantors: Nation[] = [];
    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);

    for (let i = 0; i < nation.defenseGuarantorIds.length; i++) {
      const gId = nation.defenseGuarantorIds[i]!;
      const canonicalG = CountryRegistry.resolveCanonicalId(gId);
      if (canonicalG !== canonicalNation && !seen.has(canonicalG)) {
        seen.add(canonicalG);
        const gNation = this.resolveNation(canonicalG, allNations);
        if (gNation && gNation.isAlive) {
          guarantors.push(gNation);
        }
      }
    }

    return guarantors;
  }

  public static isAlive(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
  ): boolean {
    const provs =
      ownedProvinces ?? this.getOwnedProvinces(nationId, provincesMap);
    return provs.length > 0;
  }

  public static buildProvincesByOwnerMap<T extends ProvinceDynamicState>(
    provinces: Record<string, T> | T[],
  ): Map<string, T[]> {
    return NationTerritoryResolverUtility.buildProvincesByOwnerMap(provinces);
  }

  public static getOwnedProvinces<T extends ProvinceDynamicState>(
    nationId: string,
    provincesMap?: Record<string, T> | T[],
    provincesByOwnerMap?: Map<string, T[]>,
  ): T[] {
    return NationTerritoryResolverUtility.getOwnedProvinces(
      nationId,
      provincesMap,
      provincesByOwnerMap,
    );
  }

  public static getNationFactoryTiers(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
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

  public static getTerritoryPixelCount(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
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
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): boolean {
    return NationTerritoryResolverUtility.hasSeaAccess(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
    );
  }

  public static getTerritoryIndustrialCapacity(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): TerritoryIndustrialCapacity {
    return NationTerritoryResolverUtility.getTerritoryIndustrialCapacity(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
    );
  }

  public static getPopulation(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
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
      total += MapTopologyRegistry.getPopulation(p.provinceId, 0);
    }
    return total;
  }

  public static getRank(
    nationId: string,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
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
    provincesMap?: Record<string, ProvinceDynamicState>,
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
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): Map<string, number> {
    return NationRankCalculatorUtility.calculateRankMap(
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
