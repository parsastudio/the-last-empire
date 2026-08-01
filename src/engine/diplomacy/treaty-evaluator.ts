import { Nation } from "@/domain/nation/nation.schema";
import {
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface ProposalEvaluation {
  accepted: boolean;
  reason?: string;
}

export class TreatyEvaluator {
  private doctrinesManager = new DoctrinesManager();

  public evaluateProposal(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
    requestedTributeAmount?: number,
  ): ProposalEvaluation {
    const relation = receiver.relations[sender.id];
    let opinion = relation ? relation.opinion : 0;

    const thresholdBonus =
      this.doctrinesManager.getDiplomaticOpinionThresholdBonus(
        sender.doctrines?.unlockedDoctrines,
      );
    opinion += thresholdBonus;

    switch (proposalType) {
      case "SEVER_TRADE_RELATIONS":
        return { accepted: true };
      case "NON_AGGRESSION_PACT":
        if (opinion >= -10) return { accepted: true };
        return { accepted: false, reason: "OPINION_TOO_LOW" };
      case "FULL_ALLIANCE":
        if (opinion >= 60 && sender.globalReputation >= 20)
          return { accepted: true };
        return { accepted: false, reason: "REQUIREMENTS_NOT_MET" };
      case "PEACE_TREATY":
        if (opinion > -20) return { accepted: true };
        return { accepted: false, reason: "OPINION_TOO_LOW" };
      case "IMPROVE_RELATIONS":
        if (sender.treasury < (requestedTributeAmount || 10000)) {
          return { accepted: false, reason: "INSUFFICIENT_SENDER_FUNDS" };
        }
        if (opinion >= 40)
          return { accepted: false, reason: "OPINION_ALREADY_HIGH" };
        return { accepted: true };
      default:
        return { accepted: false, reason: "UNKNOWN_PROPOSAL" };
    }
  }

  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    switch (newType) {
      case "NON_AGGRESSION_PACT":
        return {
          ...profile,
          stance: "NON_AGGRESSION_PACT",
          coolOffTurnsRemaining: 0,
        };
      case "FULL_ALLIANCE":
        return { ...profile, stance: "ALLIANCE", coolOffTurnsRemaining: 0 };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "NORMAL_DIPLOMACY",
          coolOffTurnsRemaining: 5,
        };
      case "SEVER_TRADE_RELATIONS":
        return {
          ...profile,
          stance: "SEVERED_RELATIONS",
          isTradeEmbargoed: true,
          opinion: Math.min(profile.opinion, -30),
        };
      default:
        return profile;
    }
  }
}
