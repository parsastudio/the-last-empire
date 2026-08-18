import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import {
  DiplomacyLockManager,
  NationRelationResolver,
} from "@/domain/diplomacy/nation-relation-resolver.utility";

export class AITreatyEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
  ): GameAction | null {
    if (!nation.relations) {
      return null;
    }

    const allianceAction = this.evaluateAlliance(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
    );

    if (allianceAction) {
      return allianceAction;
    }

    const napAction = this.evaluateNonAggression(
      nation,
      allNations,
      provincesMap,
      lockedTargets,
    );

    if (napAction) {
      return napAction;
    }

    return null;
  }

  private static evaluateAlliance(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
  ): GameAction | null {
    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR" || rel.stance === "ALLIANCE") {
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

      const hasCommonEnemy = NationRelationResolver.hasCommonEnemy(
        nation,
        targetNation,
        allNations,
      );

      const isDeepTrust = rel.opinion >= 15 && nation.globalReputation >= 20;

      if ((hasCommonEnemy && rel.opinion >= 10) || isDeepTrust) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "FULL_ALLIANCE",
        );
      }
    }

    return null;
  }

  private static evaluateNonAggression(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    lockedTargets?: Set<string>,
  ): GameAction | null {
    const isCurrentlyAtWar = Object.values(nation.relations || {}).some(
      (r) => r.stance === "WAR",
    );

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance !== "NORMAL_DIPLOMACY") {
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

      const threatEval = AIThreatCalculator.evaluate(
        nation,
        targetNation,
        provincesMap,
      );

      const isFlankSecurity = isCurrentlyAtWar && threatEval.isNeighbor;
      const isFriendlyNeighbor =
        rel.opinion >= 10 && nation.globalReputation >= 0;

      if (isFlankSecurity || isFriendlyNeighbor) {
        return ActionFactory.diplomaticProposal(
          nation.id,
          targetNation.id,
          "NON_AGGRESSION_PACT",
        );
      }
    }

    return null;
  }
}
