import {
  Nation,
  Province,
  DiplomaticProposalType,
  GlobalCoalition,
  CountryRegistry,
  SecurityGuaranteeValidator,
  NationRelationResolver,
} from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";

export interface AcceptanceEvaluation {
  willAccept: boolean;
}

export class ProposalAcceptanceEvaluator {
  public static evaluate(
    proposalType: DiplomaticProposalType,
    receiver: Nation,
    sender: Nation,
    vector: GeopoliticalVector,
    globalCoalition?: GlobalCoalition | null,
    provincesMap?: Record<string, Province>,
    currentTurn?: number,
  ): AcceptanceEvaluation {
    if (globalCoalition && proposalType === "PEACE_TREATY") {
      const rCanonical = CountryRegistry.resolveCanonicalId(receiver.id);
      const sCanonical = CountryRegistry.resolveCanonicalId(sender.id);
      const isMemberAndTarget =
        (globalCoalition.memberNationIds.includes(rCanonical) &&
          sCanonical === globalCoalition.targetNationId) ||
        (globalCoalition.memberNationIds.includes(sCanonical) &&
          rCanonical === globalCoalition.targetNationId);

      if (isMemberAndTarget) {
        return { willAccept: false };
      }
    }

    switch (proposalType) {
      case "STRATEGIC_PARTNERSHIP": {
        const canonicalSender = CountryRegistry.resolveCanonicalId(sender.id);
        const rel = NationRelationResolver.getRelation(
          receiver.relations,
          canonicalSender,
        );

        if (!rel || rel.stance !== "NON_AGGRESSION_PACT") {
          return { willAccept: false };
        }

        return { willAccept: true };
      }

      case "SECURITY_GUARANTEE": {
        const validation = SecurityGuaranteeValidator.validate(
          sender,
          receiver,
          provincesMap,
          false,
        );

        return { willAccept: validation.isValid };
      }

      case "NON_AGGRESSION_PACT": {
        const score =
          -2 +
          Math.round(vector.alignment * 0.5) -
          Math.round(vector.tension * 0.5);

        return { willAccept: score >= 0 };
      }

      case "PEACE_TREATY": {
        const canonicalSender = CountryRegistry.resolveCanonicalId(sender.id);
        const rel =
          receiver.relations[canonicalSender] || receiver.relations[sender.id];

        if (
          currentTurn !== undefined &&
          rel?.warDeclaredTurn !== undefined &&
          currentTurn <= rel.warDeclaredTurn
        ) {
          return { willAccept: false };
        }

        let score = -50;

        if (receiver.government.stability < 30) {
          score += Math.round((30 - receiver.government.stability) * 1.5);
        }

        if (vector.powerRatio > 1.8) {
          score += Math.min(60, Math.round((vector.powerRatio - 1.0) * 35));
        } else if (vector.powerRatio < 0.9) {
          score -= Math.min(50, Math.round((1.0 - vector.powerRatio) * 50));
        }

        if (vector.reasons.revanchismPenalty > 0) {
          score -= Math.round(vector.reasons.revanchismPenalty * 1.0);
        }

        if (vector.alignment < 0) {
          score += Math.round(vector.alignment * 0.35);
        }

        return { willAccept: score >= 0 };
      }

      default:
        return { willAccept: false };
    }
  }
}
