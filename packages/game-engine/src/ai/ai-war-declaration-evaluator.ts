import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GeopoliticalReachResolver,
} from "@geopolitics/domain";
import { GeopoliticalVectorCalculator } from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class AIWarDeclarationEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
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

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (
        rel.stance === "WAR" ||
        rel.stance === "ALLIANCE" ||
        rel.stance === "NON_AGGRESSION_PACT"
      ) {
        continue;
      }

      if (DiplomacyLockManager.isLocked(lockedTargets, nation.id, targetId)) {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[canonicalTarget] || allNations[targetId];

      if (
        !targetNation ||
        !targetNation.isAlive ||
        targetNation.id === nation.id
      ) {
        continue;
      }

      if (
        !GeopoliticalReachResolver.canInitiateDiplomacy(
          nation,
          targetNation,
          allNations,
          provincesMap,
          rankMap,
        )
      ) {
        continue;
      }

      const vector = GeopoliticalVectorCalculator.calculate(
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
