import {
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  MilitaryPowerCalculator,
  GeopoliticalReachResolver,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";
import { AIPosture } from "@/engine/ai/ai-procurement-planner";

export class GeopoliticalMatrixCache {
  private provincesByOwnerMap: Map<string, Province[]>;
  private rankMap: Map<string, number>;
  private reachableTargetsMap = new Map<string, Nation[]>();
  private vectorsMap = new Map<string, Map<string, GeopoliticalVector>>();
  private powerMap = new Map<string, number>();
  private seaAccessMap = new Map<string, boolean>();
  private postureMap = new Map<string, AIPosture>();

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

    for (const nation of Object.values(allNations)) {
      if (!nation.isAlive) continue;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const provs = this.provincesByOwnerMap.get(canonicalId) || [];
      const power = Math.max(
        1,
        MilitaryPowerCalculator.calculateLandAndAirPower(nation),
      );
      const hasSea = provs.some((p) => p.hasSeaAccess);

      this.powerMap.set(canonicalId, power);
      this.seaAccessMap.set(canonicalId, hasSea);
    }
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

  public getOwnedProvinces(nationId: string): Province[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return this.provincesByOwnerMap.get(canonicalId) || [];
  }

  public getReachableTargets(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): Nation[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    let targets = this.reachableTargetsMap.get(canonicalId);
    if (!targets) {
      targets = GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        this.rankMap,
        this.getOwnedProvinces(nation.id),
        this.provincesByOwnerMap,
      );
      this.reachableTargetsMap.set(canonicalId, targets);
    }
    return targets;
  }

  public getVector(
    source: Nation,
    target: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GeopoliticalVector {
    const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);

    let sourceVectors = this.vectorsMap.get(sourceCanonical);
    if (!sourceVectors) {
      sourceVectors = new Map<string, GeopoliticalVector>();
      this.vectorsMap.set(sourceCanonical, sourceVectors);
    }

    let vector = sourceVectors.get(targetCanonical);
    if (!vector) {
      const sourceProvs = this.getOwnedProvinces(source.id);
      const sourcePower = this.powerMap.get(sourceCanonical) || 1;
      const sourceSea = this.seaAccessMap.get(sourceCanonical) ?? false;

      vector = GeopoliticalVectorCalculator.calculate(
        source,
        target,
        allNations,
        provincesMap,
        sourceProvs,
        sourcePower,
        sourceSea,
        this.provincesByOwnerMap,
      );
      sourceVectors.set(targetCanonical, vector);
    }

    return vector;
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
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    let posture = this.postureMap.get(canonicalId);
    if (posture) return posture;

    if (nation.warFocusTargetId) {
      posture = "WAR";
      this.postureMap.set(canonicalId, posture);
      return posture;
    }

    let isWar = false;
    let maxTension = 0;
    const targets = this.getReachableTargets(nation, allNations, provincesMap);

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      const rel =
        nation.relations[canonicalTarget] || nation.relations[target.id];

      if (rel && rel.stance === "WAR") {
        isWar = true;
      }

      const vector = this.getVector(nation, target, allNations, provincesMap);
      if (vector.isNeighbor && vector.tension > maxTension) {
        maxTension = vector.tension;
      }
    }

    if (isWar) {
      posture = "WAR";
    } else if (maxTension >= 55) {
      posture = "THREAT";
    } else {
      posture = "PEACE";
    }

    this.postureMap.set(canonicalId, posture);
    return posture;
  }
}
