import {
  Nation,
  Province,
  CountryRegistry,
  GeopoliticalReachResolver,
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
      const rel =
        nation.relations[canonicalTarget] || nation.relations[target.id];

      if (rel && rel.stance === "WAR") {
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

  public static calculateSpendableBudget(
    posture: AIPosture,
    effectiveTreasury: number,
    peacetimeCap = 0.5,
  ): number {
    const disposable = Math.max(0, effectiveTreasury);
    if (disposable <= 0) return 0;

    let postureMultiplier = peacetimeCap * 0.7;
    if (posture === "THREAT") postureMultiplier = Math.max(0.65, peacetimeCap);
    else if (posture === "WAR") postureMultiplier = 0.9;

    return Math.floor(disposable * postureMultiplier);
  }
}
