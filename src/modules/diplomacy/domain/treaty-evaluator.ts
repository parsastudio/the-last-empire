import type {
  RelationProfile,
  DiplomaticProposalType,
} from "@/core/types/diplomacy.types";
import type { Nation } from "@/core/types/nation.types";

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

    if (receiver.reputation < -50) {
      return { accepted: false, reason: "LOW_SENDER_REPUTATION" };
    }

    switch (proposalType) {
      case "NON_AGGRESSION_PACT":
        if (opinion >= -10) {
          return { accepted: true };
        }
        return { accepted: false, reason: "OPINION_TOO_LOW" };

      case "DEFENSIVE_PACT":
        if (opinion >= 30) {
          return { accepted: true };
        }
        return { accepted: false, reason: "OPINION_TOO_LOW" };

      case "FULL_ALLIANCE":
        if (opinion >= 60 && sender.reputation >= 20) {
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

      case "LIFT_EMBARGO":
        if (opinion >= 10) {
          return { accepted: true };
        }
        return { accepted: false, reason: "HOSTILE_RELATIONS" };

      case "DEMAND_TRIBUTE":
        if (receiver.military.infantry < sender.military.infantry * 0.3) {
          return { accepted: true };
        }
        return { accepted: false, reason: "DEFENSE_CAPABLE" };

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
          treatyTurnsRemaining: 15,
        };
      case "DEFENSIVE_PACT":
        return {
          ...profile,
          stance: "DEFENSIVE_PACT",
          treatyTurnsRemaining: 20,
        };
      case "FULL_ALLIANCE":
        return { ...profile, stance: "ALLIANCE", treatyTurnsRemaining: 25 };
      case "PEACE_TREATY":
        return { ...profile, stance: "PEACE", treatyTurnsRemaining: 10 };
      default:
        return profile;
    }
  }
}
