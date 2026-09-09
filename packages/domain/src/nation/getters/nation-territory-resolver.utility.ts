import { CountryRegistry } from "@/domain/data/countries";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

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
}
