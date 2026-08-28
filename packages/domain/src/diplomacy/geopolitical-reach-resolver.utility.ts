import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export type GeopoliticalReachTier =
  | "SUPERPOWER"
  | "REGIONAL_POWER"
  | "LOCAL_POWER";

export type ProximityTier =
  | "DIRECT_NEIGHBOR"
  | "REGIONAL_MARITIME"
  | "DISTANT_OCEAN"
  | "NONE";

export class GeopoliticalReachResolver {
  public static readonly SUPERPOWER_PERCENTAGE = 0.08;
  public static readonly REGIONAL_PERCENTAGE = 0.3;
  public static readonly MIN_SUPERPOWERS = 3;

  public static getSuperpowerCutoffRank(totalAlive: number): number {
    const safeTotal = Math.max(1, totalAlive);
    const calculated = Math.ceil(safeTotal * this.SUPERPOWER_PERCENTAGE);
    return Math.min(safeTotal, Math.max(this.MIN_SUPERPOWERS, calculated));
  }

  public static getRegionalCutoffRank(totalAlive: number): number {
    const safeTotal = Math.max(1, totalAlive);
    const superpowerCutoff = this.getSuperpowerCutoffRank(safeTotal);
    const calculated = Math.ceil(safeTotal * this.REGIONAL_PERCENTAGE);
    return Math.min(safeTotal, Math.max(superpowerCutoff + 1, calculated));
  }

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

    const totalAlive = allNations
      ? Object.values(allNations).filter((n) => n.isAlive).length
      : 100;

    const superpowerCutoff = this.getSuperpowerCutoffRank(totalAlive);
    const regionalCutoff = this.getRegionalCutoffRank(totalAlive);

    if (rank <= superpowerCutoff) {
      return "SUPERPOWER";
    }
    if (rank <= regionalCutoff) {
      return "REGIONAL_POWER";
    }
    return "LOCAL_POWER";
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

  public static getReachableTargets(
    source: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Nation[] {
    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const sourceTier = this.getReachTier(
      source,
      allNations,
      provincesMap,
      rankMap,
    );

    const reachableMap = new Map<string, Nation>();

    for (const target of Object.values(allNations)) {
      if (!target.isAlive || target.id === source.id) continue;
      const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
      if (targetCanonical === sourceCanonical) continue;

      if (!source.isAi || sourceTier === "SUPERPOWER") {
        reachableMap.set(targetCanonical, target);
        continue;
      }

      const rel =
        source.relations[targetCanonical] || source.relations[target.id];
      if (
        rel &&
        (rel.stance === "WAR" ||
          rel.stance === "STRATEGIC_PARTNERSHIP" ||
          rel.stance === "NON_AGGRESSION_PACT")
      ) {
        reachableMap.set(targetCanonical, target);
      }
    }

    if (!source.isAi || sourceTier === "SUPERPOWER" || !provincesMap) {
      return Array.from(reachableMap.values());
    }

    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );

    for (let p = 0; p < myProvs.length; p++) {
      const prov = myProvs[p]!;
      const landNeighbors = prov.landNeighbors || [];
      for (let i = 0; i < landNeighbors.length; i++) {
        const nProv = provincesMap[landNeighbors[i]!.toString()];
        if (nProv) {
          const nCanonical = CountryRegistry.resolveCanonicalId(
            nProv.ownerNationId,
          );
          if (nCanonical !== sourceCanonical && !reachableMap.has(nCanonical)) {
            const targetNation =
              allNations[nCanonical] || allNations[nProv.ownerNationId];
            if (targetNation && targetNation.isAlive) {
              reachableMap.set(nCanonical, targetNation);
            }
          }
        }
      }

      if (prov.hasSeaAccess) {
        const t1 = prov.maritimeNeighborsTier1 || [];
        for (let i = 0; i < t1.length; i++) {
          const nProv = provincesMap[t1[i]!.toString()];
          if (nProv) {
            const nCanonical = CountryRegistry.resolveCanonicalId(
              nProv.ownerNationId,
            );
            if (
              nCanonical !== sourceCanonical &&
              !reachableMap.has(nCanonical)
            ) {
              const targetNation =
                allNations[nCanonical] || allNations[nProv.ownerNationId];
              if (targetNation && targetNation.isAlive) {
                reachableMap.set(nCanonical, targetNation);
              }
            }
          }
        }

        if (sourceTier === "REGIONAL_POWER") {
          const t2 = prov.maritimeNeighborsTier2 || [];
          for (let i = 0; i < t2.length; i++) {
            const nProv = provincesMap[t2[i]!.toString()];
            if (nProv) {
              const nCanonical = CountryRegistry.resolveCanonicalId(
                nProv.ownerNationId,
              );
              if (
                nCanonical !== sourceCanonical &&
                !reachableMap.has(nCanonical)
              ) {
                const targetNation =
                  allNations[nCanonical] || allNations[nProv.ownerNationId];
                if (targetNation && targetNation.isAlive) {
                  reachableMap.set(nCanonical, targetNation);
                }
              }
            }
          }
        }
      }
    }

    return Array.from(reachableMap.values());
  }

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

  public static canInitiateDiplomacy(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
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

    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );

    if (
      this.hasDirectLandBorder(
        source,
        target,
        provincesMap,
        myProvs,
        provincesByOwnerMap,
      )
    ) {
      return true;
    }

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

    if (sourceTier === "REGIONAL_POWER") {
      if (
        this.hasRegionalMaritimeConnection(
          source,
          target,
          provincesMap,
          myProvs,
          provincesByOwnerMap,
        )
      ) {
        return true;
      }
    }

    return false;
  }
}
