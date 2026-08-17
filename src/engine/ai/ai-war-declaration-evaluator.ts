import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";

export class AIWarDeclarationEvaluator {
  public static evaluate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GameAction | null {
    if (!nation.relations) {
      return null;
    }

    const isCurrentlyAtWar = Object.values(nation.relations).some(
      (r) => r.stance === "WAR",
    );

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

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations[targetId] || allNations[canonicalTarget];

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
      );

      const powerRatio = threatResult.powerRatio;
      const isNeighbor = threatResult.isNeighbor;
      const grudge = rel.grudge ?? 0;

      const isReachable =
        isNeighbor ||
        (nation.geography.hasSeaAccess && targetNation.geography.hasSeaAccess);

      const isBloodGrudge = grudge >= 45 && powerRatio <= 1.3 && isReachable;

      const hasVulnerability =
        (targetNation.warFocusTargetId !== null &&
          targetNation.warFocusTargetId !== undefined &&
          targetNation.warFocusTargetId !== nation.id) ||
        targetNation.government.stability < 40 ||
        rel.opinion < -20;

      const isPredatoryExpansion =
        isNeighbor && powerRatio < 0.6 && hasVulnerability;

      const isPreemptiveStrike =
        isNeighbor &&
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
