import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  DiplomacyLockManager,
  GlobalCoalition,
  PeaceTermsCalculator,
} from "@geopolitics/domain";

export class AIPeaceEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
    globalCoalition?: GlobalCoalition | null,
    currentTurn?: number,
  ): GameAction | null {
    if (!nation.relations) return null;

    const sourceCanonical = CountryRegistry.resolveCanonicalId(nation.id);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance !== "WAR") continue;

      if (
        currentTurn !== undefined &&
        rel.warDeclaredTurn !== undefined &&
        currentTurn <= rel.warDeclaredTurn
      ) {
        continue;
      }

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
        targetNation.id === nation.id ||
        targetNation.isAi
      ) {
        continue;
      }

      const sourceTwmi = PeaceTermsCalculator.calculateTwmi(
        nation,
        allNations,
        provincesMap,
      );
      const targetTwmi = PeaceTermsCalculator.calculateTwmi(
        targetNation,
        allNations,
        provincesMap,
      );

      const ratio = sourceTwmi / targetTwmi;

      if (ratio < 1.0) {
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
