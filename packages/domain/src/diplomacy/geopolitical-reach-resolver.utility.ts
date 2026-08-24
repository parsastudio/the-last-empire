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
          rel.stance === "ALLIANCE" ||
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
