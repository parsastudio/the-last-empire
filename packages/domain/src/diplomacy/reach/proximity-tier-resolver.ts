import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export type ProximityTier =
  | "DIRECT_NEIGHBOR"
  | "REGIONAL_MARITIME"
  | "DISTANT_OCEAN"
  | "NONE";

export class ProximityTierResolver {
  public static hasDirectLandBorder(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    if (!provincesMap) {
      return false;
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );

    for (let p = 0; p < myProvs.length; p++) {
      const prov = myProvs[p]!;
      const neighbors = prov.landNeighbors || [];
      for (let i = 0; i < neighbors.length; i++) {
        const neighborProv = provincesMap[neighbors[i]!.toString()];
        if (
          neighborProv &&
          CountryRegistry.resolveCanonicalId(neighborProv.ownerNationId) ===
            targetCanonical
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public static isImmediateMaritimeNeighbor(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    if (!provincesMap) {
      return false;
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );

    for (let p = 0; p < myProvs.length; p++) {
      const prov = myProvs[p]!;
      if (!prov.hasSeaAccess) continue;
      const t1 = prov.maritimeNeighborsTier1 || [];
      for (let i = 0; i < t1.length; i++) {
        const neighborProv = provincesMap[t1[i]!.toString()];
        if (
          neighborProv &&
          CountryRegistry.resolveCanonicalId(neighborProv.ownerNationId) ===
            targetCanonical
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public static hasRegionalMaritimeConnection(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    if (!provincesMap) {
      return false;
    }

    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );

    if (
      this.isImmediateMaritimeNeighbor(
        source,
        target,
        provincesMap,
        myProvs,
        provincesByOwnerMap,
      )
    ) {
      return true;
    }

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    for (let p = 0; p < myProvs.length; p++) {
      const prov = myProvs[p]!;
      if (!prov.hasSeaAccess) continue;
      const t2 = prov.maritimeNeighborsTier2 || [];
      for (let i = 0; i < t2.length; i++) {
        const neighborProv = provincesMap[t2[i]!.toString()];
        if (
          neighborProv &&
          CountryRegistry.resolveCanonicalId(neighborProv.ownerNationId) ===
            targetCanonical
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public static getProximityTier(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): ProximityTier {
    if (!provincesMap) return "NONE";

    const isLand = this.hasDirectLandBorder(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
    if (isLand) return "DIRECT_NEIGHBOR";

    const isImmediateSea = this.isImmediateMaritimeNeighbor(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
    if (isImmediateSea) return "DIRECT_NEIGHBOR";

    const isRegionalSea = this.hasRegionalMaritimeConnection(
      source,
      target,
      provincesMap,
      sourceProvinces,
      provincesByOwnerMap,
    );
    if (isRegionalSea) return "REGIONAL_MARITIME";

    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );
    const sourceSea = myProvs.some((p) => p.hasSeaAccess);

    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
    const targetProvs = provincesByOwnerMap?.get(targetCanonical);
    const targetSea = targetProvs
      ? targetProvs.some((p) => p.hasSeaAccess)
      : NationGettersUtility.hasSeaAccess(
          target.id,
          provincesMap,
          undefined,
          provincesByOwnerMap,
        );

    if (sourceSea && targetSea) {
      return "DISTANT_OCEAN";
    }

    return "NONE";
  }
}
