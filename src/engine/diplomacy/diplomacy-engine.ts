import { Nation } from "@/domain/nation/nation.schema";
import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export interface BetrayalEvaluation {
  reputationPenalty: number;
  skippedSteps: number;
  hasBetrayed: boolean;
}

export class DiplomaticBetrayalCalculator {
  public calculatePenalty(stance: DiplomaticStance): BetrayalEvaluation {
    if (stance === "ALLIANCE") {
      return { reputationPenalty: 35, skippedSteps: 2, hasBetrayed: true };
    }
    if (stance === "NON_AGGRESSION_PACT") {
      return { reputationPenalty: 20, skippedSteps: 1, hasBetrayed: true };
    }
    return { reputationPenalty: 0, skippedSteps: 0, hasBetrayed: false };
  }
}

export class CoolOffManager {
  public processTurnTick(turnsRemaining: number): number {
    return Math.max(0, turnsRemaining - 1);
  }
}

export class ReputationManager {
  public applyReputationPenalty(nation: Nation, penaltyAmount: number): Nation {
    return {
      ...nation,
      globalReputation: Math.max(-100, nation.globalReputation - penaltyAmount),
    };
  }

  public applyReputationGain(nation: Nation, gainAmount: number): Nation {
    const multiplier = DoctrinesManager.getReputationGainMultiplier(
      nation.doctrines.unlockedDoctrines,
    );
    return {
      ...nation,
      globalReputation: Math.min(
        100,
        nation.globalReputation + gainAmount * multiplier,
      ),
    };
  }
}

export interface ProposalEvaluation {
  accepted: boolean;
  reason?: string;
}

export class TreatyEvaluator {
  public static calculateForeignAidCost(targetGdp: number): number {
    return Math.max(500000000, Math.floor(targetGdp * 0.03));
  }

  public evaluateProposal(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
  ): ProposalEvaluation {
    if (proposalType === "SEND_FOREIGN_AID") {
      const requiredCost = TreatyEvaluator.calculateForeignAidCost(
        getNationGdp(receiver),
      );
      return sender.treasury >= requiredCost
        ? { accepted: true }
        : { accepted: false, reason: "INSUFFICIENT_FUNDS" };
    }

    const relation = receiver.relations[sender.id];
    const opinion =
      (relation ? relation.opinion : 0) +
      DoctrinesManager.getDiplomaticOpinionThresholdBonus(
        sender.doctrines?.unlockedDoctrines,
      );

    switch (proposalType) {
      case "SEVER_TRADE_RELATIONS":
        return { accepted: true };
      case "DECLARE_WAR":
        return { accepted: true };
      case "NON_AGGRESSION_PACT":
        return opinion >= -10
          ? { accepted: true }
          : { accepted: false, reason: "OPINION_TOO_LOW" };
      case "FULL_ALLIANCE":
        return opinion >= 60 && sender.globalReputation >= 20
          ? { accepted: true }
          : { accepted: false, reason: "REQUIREMENTS_NOT_MET" };
      case "PEACE_TREATY":
        return opinion > -20
          ? { accepted: true }
          : { accepted: false, reason: "OPINION_TOO_LOW" };
      default:
        return { accepted: false, reason: "UNKNOWN_PROPOSAL" };
    }
  }

  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    switch (newType) {
      case "SEND_FOREIGN_AID":
        return {
          ...profile,
          opinion: Math.min(100, profile.opinion + 20),
        };
      case "NON_AGGRESSION_PACT":
        return {
          ...profile,
          stance: "NON_AGGRESSION_PACT",
          opinion: Math.min(100, profile.opinion + 15),
          coolOffTurnsRemaining: 0,
        };
      case "FULL_ALLIANCE":
        return {
          ...profile,
          stance: "ALLIANCE",
          opinion: Math.min(100, profile.opinion + 30),
          coolOffTurnsRemaining: 0,
        };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "NORMAL_DIPLOMACY",
          opinion: Math.max(-20, profile.opinion),
          coolOffTurnsRemaining: 5,
        };
      case "SEVER_TRADE_RELATIONS":
        return {
          ...profile,
          stance: "SEVERED_RELATIONS",
          isTradeEmbargoed: true,
          opinion: Math.max(-100, Math.min(profile.opinion - 30, -30)),
        };
      case "DECLARE_WAR":
        return {
          ...profile,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: -100,
        };
      default:
        return profile;
    }
  }
}
