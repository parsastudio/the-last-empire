import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export type GeopoliticalReachTier =
  | "SUPERPOWER"
  | "REGIONAL_POWER"
  | "LOCAL_POWER";

export class GeopoliticalReachResolver {
  public static readonly SUPERPOWER_MAX_RANK = 8;
  public static readonly REGIONAL_POWER_MAX_RANK = 20;

  public static getReachTier(
    nation: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
  ): GeopoliticalReachTier {
    const rank = NationGettersUtility.getRank(
      nation.id,
      allNations,
      provincesMap,
      rankMap,
    );
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
      return false;
    }

    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
        sourceCanonical
      ) {
        const neighbors = prov.landNeighbors;
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
    }

    return false;
  }

  public static isImmediateMaritimeNeighbor(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap) {
      return false;
    }

    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
          sourceCanonical &&
        prov.hasSeaAccess
      ) {
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
    }

    return false;
  }

  public static hasRegionalMaritimeConnection(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap) {
      return false;
    }

    if (this.isImmediateMaritimeNeighbor(source, target, provincesMap)) {
      return true;
    }

    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    for (const prov of Object.values(provincesMap)) {
      if (
        CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
          sourceCanonical &&
        prov.hasSeaAccess
      ) {
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
    }

    return false;
  }

  public static canInitiateDiplomacy(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
  ): boolean {
    if (source.id === target.id) {
      return false;
    }

    if (!source.isAi) {
      return true;
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
    const rel =
      source.relations[canonicalTarget] || source.relations[target.id];

    if (rel && rel.stance === "WAR") {
      return true;
    }

    const sourceTier = this.getReachTier(
      source,
      allNations,
      provincesMap,
      rankMap,
    );
    if (sourceTier === "SUPERPOWER") {
      return true;
    }

    const targetTier = this.getReachTier(
      target,
      allNations,
      provincesMap,
      rankMap,
    );
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
}
