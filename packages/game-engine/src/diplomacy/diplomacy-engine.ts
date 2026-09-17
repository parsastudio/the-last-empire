import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
  DIPLOMACY_CONFIG,
  ECONOMY_CONFIG,
} from "@geopolitics/domain";

export interface BetrayalEvaluation {
  reputationPenalty: number;
  skippedSteps: number;
  hasBetrayed: boolean;
}

export class DiplomaticBetrayalCalculator {
  public static calculatePenalty(stance: DiplomaticStance): BetrayalEvaluation {
    if (stance === "STRATEGIC_PARTNERSHIP") {
      return {
        reputationPenalty:
          DIPLOMACY_CONFIG.BETRAYAL_PENALTIES.STRATEGIC_PARTNERSHIP,
        skippedSteps: 2,
        hasBetrayed: true,
      };
    }
    if (stance === "NON_AGGRESSION_PACT") {
      return {
        reputationPenalty:
          DIPLOMACY_CONFIG.BETRAYAL_PENALTIES.NON_AGGRESSION_PACT,
        skippedSteps: 1,
        hasBetrayed: true,
      };
    }
    if (stance === "NORMAL_DIPLOMACY") {
      return {
        reputationPenalty: DIPLOMACY_CONFIG.BETRAYAL_PENALTIES.NORMAL_DIPLOMACY,
        skippedSteps: 0,
        hasBetrayed: true,
      };
    }
    return { reputationPenalty: 0, skippedSteps: 0, hasBetrayed: false };
  }
}

export class TreatyEvaluator {
  public static calculateForeignAidCost(targetGdp: number): number {
    return Math.floor(targetGdp * ECONOMY_CONFIG.FOREIGN_AID_RATIO);
  }

  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    const currentAlignment = profile.alignment ?? 0;
    const currentTension = profile.tension ?? 10;

    switch (newType) {
      case "CANCEL_TREATY": {
        const nextStance: DiplomaticStance =
          profile.stance === "STRATEGIC_PARTNERSHIP"
            ? "NON_AGGRESSION_PACT"
            : "NORMAL_DIPLOMACY";
        return {
          ...profile,
          stance: nextStance,
          alignment: Math.max(-100, currentAlignment - 15),
          tension: Math.min(100, currentTension + 15),
        };
      }
      case "SEND_FOREIGN_AID":
        return {
          ...profile,
          alignment: Math.min(100, currentAlignment + 25),
          tension: Math.max(0, currentTension - 15),
        };
      case "NON_AGGRESSION_PACT":
        return {
          ...profile,
          stance: "NON_AGGRESSION_PACT",
          alignment: Math.min(100, currentAlignment + 15),
          tension: Math.min(15, currentTension),
        };
      case "STRATEGIC_PARTNERSHIP":
        return {
          ...profile,
          stance: "STRATEGIC_PARTNERSHIP",
          alignment: Math.min(100, currentAlignment + 30),
          tension: 0,
        };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "NORMAL_DIPLOMACY",
          alignment: Math.max(10, currentAlignment + 20),
          tension: Math.min(25, Math.floor(currentTension * 0.3)),
        };
      case "DECLARE_WAR":
        return {
          ...profile,
          stance: "WAR",
          alignment: -100,
          tension: 100,
        };
      default:
        return profile;
    }
  }
}
