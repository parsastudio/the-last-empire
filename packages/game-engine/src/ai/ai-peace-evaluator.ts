import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  PeaceTermsCalculator,
} from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AIPeaceEvaluator {
  public static evaluate(
    nation: Nation,
    context: TurnContext,
  ): GameAction | null {
    if (!nation.relations) return null;

    const sourceCanonical = CountryRegistry.resolveCanonicalId(nation.id);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance !== "WAR") continue;

      if (
        rel.warDeclaredTurn !== undefined &&
        context.turn <= rel.warDeclaredTurn
      ) {
        continue;
      }

      if (context.isDiplomacyLocked(targetId, nation.id)) {
        continue;
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);

      if (context.globalCoalition) {
        const isMemberAndTarget =
          (context.globalCoalition.memberNationIds.includes(sourceCanonical) &&
            canonicalTarget === context.globalCoalition.targetNationId) ||
          (context.globalCoalition.memberNationIds.includes(canonicalTarget) &&
            sourceCanonical === context.globalCoalition.targetNationId);

        if (isMemberAndTarget) {
          continue;
        }
      }

      const targetNation = context.getNation(canonicalTarget);

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
        context.state.nations,
        context.state.provinces,
      );
      const targetTwmi = PeaceTermsCalculator.calculateTwmi(
        targetNation,
        context.state.nations,
        context.state.provinces,
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
