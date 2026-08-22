import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { DiplomacyLockManager } from "@/domain/diplomacy/nation-relation-resolver.utility";

export class AIWarDeclarationEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
  ): GameAction | null {
    if (!nation.relations) {
      return null;
    }

    const isCurrentlyAtWar = Object.values(nation.relations).some((rel) => {
      if (rel.stance !== "WAR") return false;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(
        rel.targetNationId,
      );
      const targetNation =
        allNations[canonicalTarget] || allNations[rel.targetNationId];
      return targetNation && targetNation.isAlive;
    });

    if (isCurrentlyAtWar) {
      return null;
    }

    if (nation.military.infantry < 4 || nation.government.stability < 35) {
      return null;
    }

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

      const threatResult = AIThreatCalculator.evaluate(
        nation,
        targetNation,
        provincesMap,
        allNations,
      );

      const powerRatio = threatResult.powerRatio;
      const isReachable =
        threatResult.isNeighbor || threatResult.isNavalReachable;
      const grudge = rel.grudge ?? 0;

      const isBloodGrudge = grudge >= 45 && powerRatio <= 1.3 && isReachable;

      const hasVulnerability =
        (targetNation.warFocusTargetId !== null &&
          targetNation.warFocusTargetId !== undefined &&
          targetNation.warFocusTargetId !== nation.id) ||
        targetNation.government.stability < 40 ||
        rel.opinion < -20;

      const isPredatoryExpansion =
        isReachable && powerRatio < 0.65 && hasVulnerability;

      const isPreemptiveStrike =
        isReachable &&
        rel.opinion <= -40 &&
        threatResult.threatScore >= 60 &&
        powerRatio <= 0.85;

      if (isBloodGrudge || isPredatoryExpansion || isPreemptiveStrike) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "DECLARE_WAR",
        );
      }
    }

    return null;
  }
}
