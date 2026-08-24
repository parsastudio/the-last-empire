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

export class AITreatyEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    rankMap?: Map<string, number>,
  ): GameAction | null {
    if (!nation.relations) return null;

    const reachableTargets = GeopoliticalReachResolver.getReachableTargets(
      nation,
      allNations,
      provincesMap,
      rankMap,
    );

    for (const targetNation of reachableTargets) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        targetNation.id,
      );
      const rel =
        nation.relations[canonicalTarget] || nation.relations[targetNation.id];

      if (!rel || rel.stance === "WAR" || rel.stance === "ALLIANCE") continue;

      if (
        DiplomacyLockManager.isLocked(lockedTargets, nation.id, targetNation.id)
      ) {
        continue;
      }

      const vector = GeopoliticalVectorCalculator.calculate(
        nation,
        targetNation,
        allNations,
        provincesMap,
      );

      const allianceUtility = UtilityDecisionEngine.calculateAllianceUtility(
        nation,
        targetNation,
        vector,
      );

      if (allianceUtility >= 30) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "FULL_ALLIANCE",
        );
      }

      if (rel.stance === "NORMAL_DIPLOMACY") {
        const napUtility = UtilityDecisionEngine.calculateNapUtility(
          nation,
          targetNation,
          vector,
        );

        if (napUtility >= 20) {
          return ActionFactory.diplomaticProposal(
            nation.id,
            targetNation.id,
            "NON_AGGRESSION_PACT",
          );
        }
      }
    }

    return null;
  }
}
