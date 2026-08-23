import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";

export type GeopoliticalReachTier =
  | "SUPERPOWER"
  | "REGIONAL_POWER"
  | "LOCAL_POWER";

export class GeopoliticalReachResolver {
  public static readonly SUPERPOWER_MAX_RANK = 8;
  public static readonly REGIONAL_POWER_MAX_RANK = 20;

  public static getReachTier(
    nation: Nation,
    _allNations?: Record<string, Nation> | Nation[],
  ): GeopoliticalReachTier {
    const rank = nation.rank || 99;
    if (rank <= this.SUPERPOWER_MAX_RANK) {
      return "SUPERPOWER";
    }
    if (rank <= this.REGIONAL_POWER_MAX_RANK) {
      return "REGIONAL_POWER";
    }
    return "LOCAL_POWER";
  }

  public static hasDirectLandBorder(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      return source.geography.landNeighbors.some(
        (id) => CountryRegistry.resolveCanonicalId(id) === canonicalTarget,
      );
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

  public static isImmediateMaritimeNeighbor(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!source.geography.hasSeaAccess || !target.geography.hasSeaAccess) {
      return false;
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
    const canonicalSource = CountryRegistry.resolveCanonicalId(source.id);

    if (
      source.geography.seaNeighbors.some(
        (id) => CountryRegistry.resolveCanonicalId(id) === canonicalTarget,
      )
    ) {
      return true;
    }

    if (!provincesMap) {
      return false;
    }

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
          canonicalSource &&
        prov.hasSeaAccess
      ) {
        const t1 = prov.maritimeNeighborsTier1 || [];
        for (let i = 0; i < t1.length; i++) {
          const neighborProvId = t1[i]!;
          const neighborProv = provincesMap[neighborProvId.toString()];
          if (
            neighborProv &&
            CountryRegistry.resolveCanonicalId(neighborProv.ownerNationId) ===
              canonicalTarget
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public static hasRegionalMaritimeConnection(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!source.geography.hasSeaAccess || !target.geography.hasSeaAccess) {
      return false;
    }

    if (this.isImmediateMaritimeNeighbor(source, target, provincesMap)) {
      return true;
    }

    if (!provincesMap) {
      return false;
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
    const canonicalSource = CountryRegistry.resolveCanonicalId(source.id);

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
          canonicalSource &&
        prov.hasSeaAccess
      ) {
        const t2 = prov.maritimeNeighborsTier2 || [];
        for (let i = 0; i < t2.length; i++) {
          const neighborProvId = t2[i]!;
          const neighborProv = provincesMap[neighborProvId.toString()];
          if (
            neighborProv &&
            CountryRegistry.resolveCanonicalId(neighborProv.ownerNationId) ===
              canonicalTarget
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public static canInitiateDiplomacy(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (source.id === target.id) {
      return false;
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
    const rel =
      source.relations[canonicalTarget] || source.relations[target.id];

    if (rel && rel.stance === "WAR") {
      return true;
    }

    const sourceTier = this.getReachTier(source, allNations);
    if (sourceTier === "SUPERPOWER") {
      return true;
    }

    const targetTier = this.getReachTier(target, allNations);
    if (targetTier === "SUPERPOWER") {
      return true;
    }

    if (this.hasDirectLandBorder(source, target, provincesMap)) {
      return true;
    }

    if (this.isImmediateMaritimeNeighbor(source, target, provincesMap)) {
      return true;
    }

    if (sourceTier === "REGIONAL_POWER") {
      if (this.hasRegionalMaritimeConnection(source, target, provincesMap)) {
        return true;
      }
    }

    return false;
  }

  public static isReachable(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): boolean {
    return this.canInitiateDiplomacy(source, target, allNations, provincesMap);
  }
}
