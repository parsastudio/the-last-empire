import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GeopoliticalReachResolver,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class AIWarDeclarationEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
    reachableTargets?: Nation[],
    vectorsByTarget?: Map<string, GeopoliticalVector>,
  ): GameAction | null {
    if (!nation.relations) return null;

    const isCurrentlyAtWar = Object.values(nation.relations).some((rel) => {
      if (rel.stance !== "WAR") return false;
      const targetNation =
        allNations[CountryRegistry.resolveCanonicalId(rel.targetNationId)] ||
        allNations[rel.targetNationId];
      return targetNation && targetNation.isAlive;
    });

    if (isCurrentlyAtWar) return null;

    let bestTargetId: string | null = null;
    let highestWarUtility = 55;

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    for (const targetNation of targets) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel =
        nation.relations[canonicalTarget] || nation.relations[targetNation.id];

      if (
        rel &&
        (rel.stance === "WAR" ||
          rel.stance === "ALLIANCE" ||
          rel.stance === "NON_AGGRESSION_PACT")
      ) {
        continue;
      }

      if (
        DiplomacyLockManager.isLocked(lockedTargets, nation.id, targetNation.id)
      ) {
        continue;
      }

      const vector =
        vectorsByTarget?.get(canonicalTarget) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          targetNation,
          allNations,
          provincesMap,
        );

      const warUtility = UtilityDecisionEngine.calculateWarUtility(
        nation,
        targetNation,
        vector,
      );

      if (warUtility > highestWarUtility) {
        highestWarUtility = warUtility;
        bestTargetId = targetNation.id;
      }
    }

    if (bestTargetId) {
      return ActionFactory.diplomaticProposal(
        nation.id,
        bestTargetId,
        "DECLARE_WAR",
      );
    }

    return null;
  }
}
