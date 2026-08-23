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
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";

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

      if (
        !GeopoliticalReachResolver.canInitiateDiplomacy(
          nation,
          targetNation,
          allNations,
          provincesMap,
        )
      ) {
        continue;
      }

      const hasCommonEnemy = NationRelationResolver.hasCommonEnemy(
        nation,
        targetNation,
        allNations,
      );

      const isDeepTrust = rel.opinion >= 25 && nation.globalReputation >= 20;

      if ((hasCommonEnemy && rel.opinion >= 15) || isDeepTrust) {
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
      (rel) => {
        if (rel.stance !== "WAR") return false;
        const canonicalTarget = CountryRegistry.resolveCanonicalId(
          rel.targetNationId,
        );
        const targetNation =
          allNations[canonicalTarget] || allNations[rel.targetNationId];
        return targetNation && targetNation.isAlive;
      },
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

      if (
        !GeopoliticalReachResolver.canInitiateDiplomacy(
          nation,
          targetNation,
          allNations,
          provincesMap,
        )
      ) {
        continue;
      }

      const threatEval = AIThreatCalculator.evaluate(
        nation,
        targetNation,
        provincesMap,
        allNations,
      );

      const isFlankSecurity = isCurrentlyAtWar && threatEval.isNeighbor;
      const isFriendlyNeighbor =
        rel.opinion >= 10 &&
        nation.globalReputation >= 0 &&
        threatEval.isNeighbor;

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
