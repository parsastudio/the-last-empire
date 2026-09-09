import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { GeopoliticalTierClassifier } from "@/domain/diplomacy/reach/geopolitical-tier-classifier";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export class ReachableTargetsResolver {
  public static getReachableTargets(
    source: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    sourceProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Nation[] {
    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const sourceTier = GeopoliticalTierClassifier.getReachTier(
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
      const landNeighbors =
        prov.landNeighbors ??
        MapTopologyRegistry.getLandNeighbors(prov.provinceId);

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

      const hasSea =
        prov.hasSeaAccess ?? MapTopologyRegistry.hasSeaAccess(prov.provinceId);

      if (hasSea) {
        const t1 =
          prov.maritimeNeighborsTier1 ??
          MapTopologyRegistry.getMaritimeNeighborsTier1(prov.provinceId);

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
          const t2 =
            prov.maritimeNeighborsTier2 ??
            MapTopologyRegistry.getMaritimeNeighborsTier2(prov.provinceId);

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

  public static canInitiateDiplomacy(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
  ): boolean {
    if (!allNations) return true;
    const reachable = this.getReachableTargets(
      source,
      allNations,
      provincesMap,
      rankMap,
    );
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
    return reachable.some(
      (r) => CountryRegistry.resolveCanonicalId(r.id) === targetCanonical,
    );
  }
}
