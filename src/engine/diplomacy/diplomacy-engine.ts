import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";

export interface BetrayalEvaluation {
  reputationPenalty: number;
  skippedSteps: number;
  hasBetrayed: boolean;
}

export class DiplomaticBetrayalCalculator {
  public static calculatePenalty(stance: DiplomaticStance): BetrayalEvaluation {
    if (stance === "ALLIANCE") {
      return { reputationPenalty: 35, skippedSteps: 2, hasBetrayed: true };
    }
    if (stance === "NON_AGGRESSION_PACT") {
      return { reputationPenalty: 20, skippedSteps: 1, hasBetrayed: true };
    }
    return { reputationPenalty: 0, skippedSteps: 0, hasBetrayed: false };
  }
}

export class TreatyEvaluator {
  public static calculateForeignAidCost(
    senderGdp: number,
    targetGdp: number,
  ): number {
    const senderBudget = Math.floor(senderGdp * 0.04);
    const targetNeed = Math.floor(targetGdp * 0.02);
    return Math.max(500_000_000, Math.min(senderBudget, targetNeed));
  }

  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    const currentGrudge = profile.grudge ?? 0;

    switch (newType) {
      case "SEND_FOREIGN_AID":
        return {
          ...profile,
          opinion: Math.min(100, profile.opinion + 25),
          grudge: Math.max(0, currentGrudge - 20),
        };
      case "NON_AGGRESSION_PACT":
        return {
          ...profile,
          stance: "NON_AGGRESSION_PACT",
          opinion: Math.min(100, profile.opinion + 15),
          grudge: Math.max(0, currentGrudge - 10),
        };
      case "FULL_ALLIANCE":
        return {
          ...profile,
          stance: "ALLIANCE",
          opinion: Math.min(100, profile.opinion + 30),
          grudge: 0,
        };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "NORMAL_DIPLOMACY",
          opinion: Math.max(-10, profile.opinion),
          grudge: Math.floor(currentGrudge * 0.4),
        };
      case "DECLARE_WAR":
        return {
          ...profile,
          stance: "WAR",
          opinion: -100,
          grudge: Math.min(100, currentGrudge + 30),
        };
      default:
        return profile;
    }
  }
}
