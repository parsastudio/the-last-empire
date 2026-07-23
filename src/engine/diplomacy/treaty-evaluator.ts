import type { Nation } from "@/domain/nation/nation.schema";
import type {
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";

export interface ProposalEvaluation {
  accepted: boolean;
  reason?: string;
}

export class TreatyEvaluator {
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
    const receiverPower =
      receiver.military.infantry * 1.0 +
      receiver.military.airForce * 3.0 +
      receiver.military.droneMissile * 2.5;
    const senderPower =
      sender.military.infantry * 1.0 +
      sender.military.airForce * 3.0 +
      sender.military.droneMissile * 2.5;

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
        if (receiver.warExhaustion > 40 || opinion > -20) {
          return { accepted: true };
        }
        return { accepted: false, reason: "WAR_EXHAUSTION_TOO_LOW" };
      case "MILITARY_ACCESS":
        if (opinion >= 20) {
          return { accepted: true };
        }
        return { accepted: false, reason: "OPINION_TOO_LOW" };
      case "DEMAND_TRIBUTE":
        if (receiverPower < senderPower * 0.3) {
          return { accepted: true };
        }
        return { accepted: false, reason: "DEFENSE_CAPABLE" };
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
        return {
          ...profile,
          stance: "ALLIANCE",
          coolOffTurnsRemaining: 0,
        };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "PEACE",
          coolOffTurnsRemaining: 10,
        };
      default:
        return profile;
    }
  }
}
