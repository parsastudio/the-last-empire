import {
  Nation,
  Province,
  CountryRegistry,
  GeopoliticalReachResolver,
  NationRelationResolver,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

export type AIPosture = "PEACE" | "THREAT" | "WAR";

export class AIPostureEvaluator {
  public static evaluatePosture(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    vectorsByTarget?: Map<string, GeopoliticalVector>,
    reachableTargets?: Nation[],
  ): AIPosture {
    if (nation.warFocusTargetId) {
      return "WAR";
    }

    let maxTension = 0;

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      const isWar = NationRelationResolver.isWar(
        nation.relations,
        canonicalTarget,
      );

      if (isWar) {
        return "WAR";
      }

      const vector =
        vectorsByTarget?.get(canonicalTarget) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          target,
          allNations,
          provincesMap,
        );

      if (vector.isNeighbor && vector.tension > maxTension) {
        maxTension = vector.tension;
      }
    }

    if (maxTension >= 55) return "THREAT";
    return "PEACE";
  }
}
