import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GeopoliticalReachResolver,
  getNationGdp,
  NationRelationResolver,
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

    if (nation.warFocusTargetId) {
      return null;
    }

    if ((nation.postWarCooldownTurns || 0) > 0) {
      return null;
    }

    if (NationRelationResolver.isAtWar(nation, allNations)) {
      return null;
    }

    let bestTargetId: string | null = null;
    let highestWarUtility = 35;

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    for (let i = 0; i < targets.length; i++) {
      const targetNation = targets[i]!;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel = NationRelationResolver.getRelation(
        nation.relations,
        canonicalTarget,
      );

      if (
        rel &&
        (rel.stance === "WAR" ||
          rel.stance === "STRATEGIC_PARTNERSHIP" ||
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

      const targetGdp = getNationGdp(targetNation, provincesMap);

      const warUtility = UtilityDecisionEngine.calculateWarUtility(
        nation,
        targetNation,
        vector,
        targetGdp,
        allNations,
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
