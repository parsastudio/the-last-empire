import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GlobalCoalition,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class AIPeaceEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    vectorsByTarget?: Map<string, GeopoliticalVector>,
    globalCoalition?: GlobalCoalition | null,
  ): GameAction | null {
    if (!nation.relations) return null;

    const sourceCanonical = CountryRegistry.resolveCanonicalId(nation.id);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance !== "WAR") continue;

      if (DiplomacyLockManager.isLocked(lockedTargets, nation.id, targetId)) {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);

      if (globalCoalition) {
        const isMemberAndTarget =
          (globalCoalition.memberNationIds.includes(sourceCanonical) &&
            canonicalTarget === globalCoalition.targetNationId) ||
          (globalCoalition.memberNationIds.includes(canonicalTarget) &&
            sourceCanonical === globalCoalition.targetNationId);

        if (isMemberAndTarget) {
          continue;
        }
      }

      const targetNation = allNations[canonicalTarget] || allNations[targetId];

      if (
        !targetNation ||
        !targetNation.isAlive ||
        targetNation.id === nation.id
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

      const peaceUtility = UtilityDecisionEngine.calculatePeaceUtility(
        nation,
        targetNation,
        vector,
      );

      if (peaceUtility >= 60) {
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
