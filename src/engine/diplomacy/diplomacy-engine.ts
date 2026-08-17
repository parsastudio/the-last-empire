import { Nation } from "@/domain/nation/nation.schema";
import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";

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

export interface ProposalEvaluation {
  accepted: boolean;
  reason?: string;
}

export class TreatyEvaluator {
  public static calculateForeignAidCost(
    senderOrTargetGdp: number,
    optionalTargetGdp?: number,
  ): number {
    if (optionalTargetGdp !== undefined) {
      const senderBudget = Math.floor(senderOrTargetGdp * 0.04);
      const targetNeed = Math.floor(optionalTargetGdp * 0.02);
      return Math.max(500_000_000, Math.min(senderBudget, targetNeed));
    }
    return Math.max(500_000_000, Math.floor(senderOrTargetGdp * 0.02));
  }

  public evaluateProposal(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
  ): ProposalEvaluation {
    const senderGdp = getNationGdp(sender);
    const receiverGdp = getNationGdp(receiver);

    if (proposalType === "SEND_FOREIGN_AID") {
      const requiredCost = TreatyEvaluator.calculateForeignAidCost(
        senderGdp,
        receiverGdp,
      );
      return sender.treasury >= requiredCost
        ? { accepted: true }
        : { accepted: false, reason: "INSUFFICIENT_FUNDS" };
    }

    const relation = receiver.relations[sender.id];
    const isAtWar = relation?.stance === "WAR";
    const opinion =
      (relation ? relation.opinion : 0) +
      DoctrinesManager.getDiplomaticOpinionThresholdBonus(
        sender.doctrines?.unlockedDoctrines,
      );

    switch (proposalType) {
      case "SEVER_TRADE_RELATIONS":
      case "DECLARE_WAR":
        return { accepted: true };
      case "NON_AGGRESSION_PACT":
        return opinion >= -15
          ? { accepted: true }
          : { accepted: false, reason: "OPINION_TOO_LOW" };
      case "FULL_ALLIANCE": {
        const hasCommonEnemy = Object.entries(sender.relations).some(
          ([targetId, rel]) =>
            rel.stance === "WAR" &&
            receiver.relations[targetId]?.stance === "WAR",
        );
        const threshold = hasCommonEnemy ? 20 : 50;
        return opinion >= threshold && sender.globalReputation >= 10
          ? { accepted: true }
          : { accepted: false, reason: "REQUIREMENTS_NOT_MET" };
      }
      case "PEACE_TREATY": {
        if (!isAtWar) {
          return opinion > -20
            ? { accepted: true }
            : { accepted: false, reason: "OPINION_TOO_LOW" };
        }

        const senderPower =
          MilitaryPowerCalculator.calculateEffectivePower(sender);
        const receiverPower =
          MilitaryPowerCalculator.calculateEffectivePower(receiver);

        const isReceiverOverwhelming =
          receiverPower > senderPower * 3.0 &&
          receiver.government.stability >= 65;

        if (isReceiverOverwhelming) {
          return { accepted: false, reason: "DEMANDING_FULL_CONQUEST" };
        }

        return { accepted: true };
      }
      default:
        return { accepted: false, reason: "UNKNOWN_PROPOSAL" };
    }
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
      case "SEVER_TRADE_RELATIONS":
        return {
          ...profile,
          stance: "SEVERED_RELATIONS",
          opinion: Math.max(-100, Math.min(profile.opinion - 30, -30)),
          grudge: Math.min(100, currentGrudge + 15),
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
