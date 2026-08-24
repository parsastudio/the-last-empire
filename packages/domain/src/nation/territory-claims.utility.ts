import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";

export class TerritoryClaimsUtility {
  public static createPairKey(victimId: string, occupierId: string): string {
    const v = CountryRegistry.resolveCanonicalId(victimId);
    const o = CountryRegistry.resolveCanonicalId(occupierId);
    return `${v}:${o}`;
  }

  public static buildOccupiedTerritoryMap(
    provincesMap?: Record<string, Province> | Province[],
  ): Map<string, number> {
    const map = new Map<string, number>();
    if (!provincesMap) return map;

    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);

    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      if (!p.countryNumericId) continue;

      const originalNation = CountryRegistry.resolveCanonicalId(
        p.countryNumericId,
      );
      const currentOwner = CountryRegistry.resolveCanonicalId(p.ownerNationId);

      if (originalNation && currentOwner && originalNation !== currentOwner) {
        const key = `${originalNation}:${currentOwner}`;
        const currentCount = map.get(key) || 0;
        map.set(key, currentCount + 1);
      }
    }

    return map;
  }

  public static getOccupiedProvinceCount(
    victimId: string,
    occupierId: string,
    occupiedMap?: Map<string, number>,
    provincesMap?: Record<string, Province> | Province[],
  ): number {
    const key = this.createPairKey(victimId, occupierId);
    if (occupiedMap) {
      return occupiedMap.get(key) || 0;
    }
    if (provincesMap) {
      const map = this.buildOccupiedTerritoryMap(provincesMap);
      return map.get(key) || 0;
    }
    return 0;
  }
}
