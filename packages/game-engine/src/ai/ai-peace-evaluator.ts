import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
} from "@geopolitics/domain";
import { GeopoliticalVectorCalculator } from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class AIPeaceEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
  ): GameAction | null {
    if (!nation.relations) return null;

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance !== "WAR") continue;

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

      const vector = GeopoliticalVectorCalculator.calculate(
        nation,
        targetNation,
        allNations,
        provincesMap,
      );

      const peaceUtility = UtilityDecisionEngine.calculatePeaceUtility(
        nation,
        targetNation,
        vector,
      );

      if (peaceUtility >= 35) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "PEACE_TREATY",
        );
      }
    }

    return null;
  }
}
