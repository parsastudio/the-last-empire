import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
} from "@geopolitics/domain";

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
    _senderGdpOrTargetGdp: number,
    targetGdp?: number,
  ): number {
    const effectiveTargetGdp =
      targetGdp !== undefined ? targetGdp : _senderGdpOrTargetGdp;
    return Math.floor(effectiveTargetGdp * 0.03);
  }

  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    const currentGrudge = profile.grudge ?? 0;
    const currentAlignment = profile.alignment ?? 0;
    const currentTension = profile.tension ?? 10;

    switch (newType) {
      case "SEND_FOREIGN_AID":
        return {
          ...profile,
          alignment: Math.min(100, currentAlignment + 25),
          tension: Math.max(0, currentTension - 15),
          grudge: Math.max(0, currentGrudge - 20),
        };
      case "NON_AGGRESSION_PACT":
        return {
          ...profile,
          stance: "NON_AGGRESSION_PACT",
          alignment: Math.min(100, currentAlignment + 15),
          tension: Math.min(20, currentTension),
          grudge: Math.max(0, currentGrudge - 10),
        };
      case "FULL_ALLIANCE":
        return {
          ...profile,
          stance: "ALLIANCE",
          alignment: Math.min(100, currentAlignment + 30),
          tension: 0,
          grudge: 0,
        };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "NORMAL_DIPLOMACY",
          alignment: Math.max(10, currentAlignment + 20),
          tension: Math.min(30, Math.floor(currentTension * 0.3)),
          grudge: Math.min(5, Math.floor(currentGrudge * 0.1)),
        };
      case "DECLARE_WAR":
        return {
          ...profile,
          stance: "WAR",
          alignment: -100,
          tension: 100,
          grudge: Math.min(100, currentGrudge + 30),
        };
      default:
        return profile;
    }
  }
}
