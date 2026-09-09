import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  NationRelationResolver,
} from "@geopolitics/domain";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AIWarDeclarationEvaluator {
  public static evaluate(
    nation: Nation,
    context: TurnContext,
  ): GameAction | null {
    if (!nation.relations) return null;

    if (nation.warFocusTargetId) {
      return null;
    }

    if ((nation.postWarCooldownTurns || 0) > 0) {
      return null;
    }

    if (context.isAtWar(nation)) {
      return null;
    }

    let bestTargetId: string | null = null;
    let highestWarUtility = 45;

    const targets = context.getReachableTargets(nation);

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

      if (context.isDiplomacyLocked(targetNation.id, nation.id)) {
        continue;
      }

      const vector = context.getVector(nation, targetNation);
      if (!vector) continue;

      const targetGdp = context.getNationGdp(targetNation.id);

      const warUtility = UtilityDecisionEngine.calculateWarUtility(
        nation,
        targetNation,
        vector,
        targetGdp,
        context.state.nations,
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
