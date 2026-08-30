import {
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  TerritoryClaimsUtility,
} from "@geopolitics/domain";
import {
  GeopoliticalVector,
  GeopoliticalVectorCalculator,
} from "@/engine/ai/geopolitical-vector-calculator";
import {
  AIPosture,
  AIProcurementPlanner,
} from "@/engine/ai/ai-procurement-planner";

export class GeopoliticalMatrixCache {
  private rankMap: Map<string, number>;
  private provincesByOwnerMap: Map<string, Province[]>;
  private occupiedTerritoryMap: Map<string, number>;
  private vectorsCache = new Map<string, Map<string, GeopoliticalVector>>();
  private postureCache = new Map<string, AIPosture>();

  private constructor(
    rankMap: Map<string, number>,
    provincesByOwnerMap: Map<string, Province[]>,
    occupiedTerritoryMap: Map<string, number>,
  ) {
    this.rankMap = rankMap;
    this.provincesByOwnerMap = provincesByOwnerMap;
    this.occupiedTerritoryMap = occupiedTerritoryMap;
  }

  public static build(
    allNations: Record<string, Nation>,
    provinces: Record<string, Province> | Province[],
  ): GeopoliticalMatrixCache {
    const provincesByOwnerMap =
      NationGettersUtility.buildProvincesByOwnerMap(provinces);

    const rankMap = NationGettersUtility.calculateRankMap(
      allNations,
      Array.isArray(provinces) ? undefined : provinces,
    );

    const occupiedTerritoryMap =
      TerritoryClaimsUtility.buildOccupiedTerritoryMap(provinces);

    return new GeopoliticalMatrixCache(
      rankMap,
      provincesByOwnerMap,
      occupiedTerritoryMap,
    );
  }

  public getRankMap(): Map<string, number> {
    return this.rankMap;
  }

  public getProvincesByOwnerMap(): Map<string, Province[]> {
    return this.provincesByOwnerMap;
  }

  public getOccupiedTerritoryMap(): Map<string, number> {
    return this.occupiedTerritoryMap;
  }

  public getOwnedProvinces(nationId: string): Province[] {
    const canonical = CountryRegistry.resolveCanonicalId(nationId);
    return (
      this.provincesByOwnerMap.get(canonical) ??
      this.provincesByOwnerMap.get(nationId) ??
      []
    );
  }

  public getVectorsForNation(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Map<string, GeopoliticalVector> {
    const canonicalSource = CountryRegistry.resolveCanonicalId(nation.id);
    const cached = this.vectorsCache.get(canonicalSource);
    if (cached) return cached;

    const map = new Map<string, GeopoliticalVector>();
    const myProvs = this.getOwnedProvinces(canonicalSource);

    for (const other of Object.values(allNations)) {
      if (!other.isAlive || other.id === nation.id) continue;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(other.id);
      if (canonicalTarget === canonicalSource) continue;

      const vector = GeopoliticalVectorCalculator.calculate(
        nation,
        other,
        allNations,
        provincesMap,
        myProvs,
        undefined,
        this.provincesByOwnerMap,
        this.occupiedTerritoryMap,
      );

      map.set(canonicalTarget, vector);
      map.set(other.id, vector);
    }

    this.vectorsCache.set(canonicalSource, map);
    return map;
  }

  public getPosture(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): AIPosture {
    const canonical = CountryRegistry.resolveCanonicalId(nation.id);
    const cached = this.postureCache.get(canonical);
    if (cached) return cached;

    const posture = AIProcurementPlanner.evaluatePosture(
      nation,
      allNations,
      provincesMap,
      this.rankMap,
    );

    this.postureCache.set(canonical, posture);
    return posture;
  }

  public getReachableTargets(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Nation[] {
    const vectors = this.getVectorsForNation(nation, allNations, provincesMap);
    const targets: Nation[] = [];

    for (const other of Object.values(allNations)) {
      if (!other.isAlive || other.id === nation.id) continue;
      const vector = vectors.get(CountryRegistry.resolveCanonicalId(other.id));
      if (vector && vector.proximityTier !== "NONE") {
        targets.push(other);
      }
    }

    return targets;
  }
}
