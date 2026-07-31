import { Nation } from "@/domain/nation/nation.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";

export interface ProposalEvaluation {
  accepted: boolean;
  reason?: string;
}

export class TreatyProposalEvaluator {
  public evaluateProposal(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
  ): ProposalEvaluation {
    const relation = receiver.relations[sender.id];
    const opinion = relation ? relation.opinion : 0;
    if (receiver.globalReputation < -50) {
      return { accepted: false, reason: "LOW_SENDER_REPUTATION" };
    }

    switch (proposalType) {
      case "NON_AGGRESSION_PACT":
        if (opinion >= -10) {
          return { accepted: true };
        }
        return { accepted: false, reason: "OPINION_TOO_LOW" };
      case "FULL_ALLIANCE":
        if (opinion >= 60 && sender.globalReputation >= 20) {
          return { accepted: true };
        }
        return { accepted: false, reason: "REQUIREMENTS_NOT_MET" };
      case "PEACE_TREATY":
        if (opinion > -20) {
          return { accepted: true };
        }
        return { accepted: false, reason: "OPINION_TOO_LOW" };
      case "IMPROVE_RELATIONS":
        if (sender.treasury < 10000) {
          return { accepted: false, reason: "INSUFFICIENT_SENDER_FUNDS" };
        }
        if (opinion >= 40) {
          return { accepted: false, reason: "OPINION_ALREADY_HIGH" };
        }
        return { accepted: true };
      default:
        return { accepted: false, reason: "UNKNOWN_PROPOSAL" };
    }
  }
}
