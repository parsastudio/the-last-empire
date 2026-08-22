import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";

export type GeopoliticalReachTier =
  | "SUPERPOWER"
  | "REGIONAL_POWER"
  | "LOCAL_POWER";

export class GeopoliticalReachResolver {
  public static getReachTier(
    _nation: Nation,
    _allNations?: Record<string, Nation> | Nation[],
  ): GeopoliticalReachTier {
    return "SUPERPOWER";
  }

  public static isImmediateMaritimeNeighbor(
    source: Nation,
    target: Nation,
    _provincesMap?: Record<string, Province>,
  ): boolean {
    if (!source.geography.hasSeaAccess || !target.geography.hasSeaAccess) {
      return false;
    }
    return source.geography.seaNeighbors.includes(target.id);
  }

  public static hasDirectLandBorder(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap) {
      return source.geography.landNeighbors.includes(target.id);
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
        targetCanonical
      ) {
        if (
          LandNeighborResolver.hasProvinceLandBorder(
            prov.provinceId,
            source.id,
            provincesMap,
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public static isReachable(
    _source: Nation,
    _target: Nation,
    _allNations?: Record<string, Nation>,
    _provincesMap?: Record<string, Province>,
  ): boolean {
    return true;
  }

  public static canInitiateDiplomacy(
    _source: Nation,
    _target: Nation,
    _allNations?: Record<string, Nation>,
    _provincesMap?: Record<string, Province>,
  ): boolean {
    return true;
  }
}
