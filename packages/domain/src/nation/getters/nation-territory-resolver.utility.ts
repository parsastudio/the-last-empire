import { CountryRegistry } from "@/domain/data/countries";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export interface TerritoryIndustrialCapacity {
  totalActiveFactories: number;
  totalMaxSlots: number;
  totalEmptySlots: number;
  slotSaturationRatio: number;
  occupancyPercentage: number;
}

export class NationTerritoryResolverUtility {
  public static buildProvincesByOwnerMap<T extends ProvinceDynamicState>(
    provincesMap?: Record<string, T> | T[],
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    if (!provincesMap) return map;

    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);

    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      const cid = CountryRegistry.resolveCanonicalId(p.ownerNationId);
      let group = map.get(cid);
      if (!group) {
        group = [];
        map.set(cid, group);
      }
      group.push(p);
    }

    return map;
  }

  public static getOwnedProvinces<T extends ProvinceDynamicState>(
    nationId: string,
    provincesMap?: Record<string, T> | T[],
    provincesByOwnerMap?: Map<string, T[]>,
  ): T[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (provincesByOwnerMap) {
      return (
        provincesByOwnerMap.get(canonicalId) ??
        provincesByOwnerMap.get(nationId) ??
        []
      );
    }
    if (!provincesMap) return [];
    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);
    return list.filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId,
    );
  }

  public static getTerritoryPixelCount(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      total += MapTopologyRegistry.getPixelCount(p.provinceId, 0);
    }
    return total;
  }

  public static hasSeaAccess(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): boolean {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      const hasSea = MapTopologyRegistry.hasSeaAccess(p.provinceId, false);
      if (hasSea) return true;
    }
    return false;
  }

  public static getTerritoryIndustrialCapacity(
    nationId: string,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
    provincesByOwnerMap?: Map<string, ProvinceDynamicState[]>,
  ): TerritoryIndustrialCapacity {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let totalActiveFactories = 0;
    let totalMaxSlots = 0;

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      const maxSlots = MapTopologyRegistry.getMaxSlots(p.provinceId, 1);
      totalActiveFactories += p.factoriesCount || 0;
      totalMaxSlots += maxSlots;
    }

    const totalEmptySlots = Math.max(0, totalMaxSlots - totalActiveFactories);
    const slotSaturationRatio =
      totalMaxSlots > 0 ? totalActiveFactories / totalMaxSlots : 1.0;
    const occupancyPercentage =
      totalMaxSlots > 0
        ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
        : 100;

    return {
      totalActiveFactories,
      totalMaxSlots,
      totalEmptySlots,
      slotSaturationRatio,
      occupancyPercentage,
    };
  }
}
