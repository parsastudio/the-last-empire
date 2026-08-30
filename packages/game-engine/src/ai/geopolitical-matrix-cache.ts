import {
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  GeopoliticalReachResolver,
  TerritoryClaimsUtility,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";
import {
  AIPosture,
  AIPostureEvaluator,
} from "@/engine/ai/procurement/ai-posture-evaluator";

export class GeopoliticalMatrixCache {
  private provincesByOwnerMap: Map<string, Province[]>;
  private rankMap: Map<string, number>;
  private occupiedTerritoryMap: Map<string, number>;

  constructor(
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province>,
  ) {
    this.provincesByOwnerMap =
      NationGettersUtility.buildProvincesByOwnerMap(provincesMap);
    this.rankMap = NationGettersUtility.calculateRankMap(
      allNations,
      provincesMap,
      this.provincesByOwnerMap,
    );
    this.occupiedTerritoryMap =
      TerritoryClaimsUtility.buildOccupiedTerritoryMap(provincesMap);
  }

  public static build(
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province>,
  ): GeopoliticalMatrixCache {
    return new GeopoliticalMatrixCache(allNations, provincesMap);
  }

  public getProvincesByOwnerMap(): Map<string, Province[]> {
    return this.provincesByOwnerMap;
  }

  public getRankMap(): Map<string, number> {
    return this.rankMap;
  }

  public getOccupiedTerritoryMap(): Map<string, number> {
    return this.occupiedTerritoryMap;
  }

  public getOwnedProvinces(nationId: string): Province[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return this.provincesByOwnerMap.get(canonicalId) || [];
  }

  public getReachableTargets(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Nation[] {
    return GeopoliticalReachResolver.getReachableTargets(
      nation,
      allNations,
      provincesMap,
      this.rankMap,
      this.getOwnedProvinces(nation.id),
      this.provincesByOwnerMap,
    );
  }

  public getVector(
    source: Nation,
    target: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GeopoliticalVector {
    const sourceProvs = this.getOwnedProvinces(source.id);
    return GeopoliticalVectorCalculator.calculate(
      source,
      target,
      allNations,
      provincesMap,
      sourceProvs,
      undefined,
      this.provincesByOwnerMap,
      this.occupiedTerritoryMap,
    );
  }

  public getVectorsForNation(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Map<string, GeopoliticalVector> {
    const targets = this.getReachableTargets(nation, allNations, provincesMap);
    const map = new Map<string, GeopoliticalVector>();

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]!;
      const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
      const vector = this.getVector(nation, target, allNations, provincesMap);
      map.set(targetCanonical, vector);
    }

    return map;
  }

  public getPosture(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): AIPosture {
    const reachableTargets = this.getReachableTargets(
      nation,
      allNations,
      provincesMap,
    );
    const vectorsByTarget = this.getVectorsForNation(
      nation,
      allNations,
      provincesMap,
    );

    return AIPostureEvaluator.evaluatePosture(
      nation,
      allNations,
      provincesMap,
      this.rankMap,
      vectorsByTarget,
      reachableTargets,
    );
  }
}
