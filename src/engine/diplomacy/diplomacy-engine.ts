import { Nation } from "@/domain/nation/nation.schema";
import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface BetrayalEvaluation {
  reputationPenalty: number;
  skippedSteps: number;
  hasBetrayed: boolean;
}

export class DiplomaticBetrayalCalculator {
  public calculatePenalty(stance: DiplomaticStance): BetrayalEvaluation {
    if (stance === "ALLIANCE") {
      return { reputationPenalty: 50, skippedSteps: 2, hasBetrayed: true };
    }
    if (stance === "NON_AGGRESSION_PACT") {
      return { reputationPenalty: 25, skippedSteps: 1, hasBetrayed: true };
    }
    return { reputationPenalty: 0, skippedSteps: 0, hasBetrayed: false };
  }
}

export interface CoolOffTransitionResult {
  nextStance: DiplomaticStance;
  turnsRemaining: number;
}

export class CoolOffManager {
  public processTurnTick(turnsRemaining: number): number {
    return Math.max(0, turnsRemaining - 1);
  }
}

export class DiplomaticOpinionCalculator {
  public calculateOpinion(
    currentOpinion: number,
    globalReputation: number,
    stance: DiplomaticStance,
    isLandNeighbor: boolean,
    govFrictionValue = 0,
  ): number {
    let stanceModifier = isLandNeighbor ? -10 : 0;
    switch (stance) {
      case "WAR":
        stanceModifier -= 80;
        break;
      case "SEVERED_RELATIONS":
        stanceModifier -= 30;
        break;
      case "NON_AGGRESSION_PACT":
        stanceModifier += 30;
        break;
      case "ALLIANCE":
        stanceModifier += 50;
        break;
      default:
        break;
    }
    const target = Math.max(
      -100,
      Math.min(100, globalReputation + stanceModifier + govFrictionValue * 5),
    );
    return Math.max(
      -100,
      Math.min(
        100,
        Math.round(currentOpinion + (target - currentOpinion) * 0.2),
      ),
    );
  }
}

export interface PowerScoreDetails {
  economicScore: number;
  militaryScore: number;
  powerScore: number;
}

export class PowerScoreCalculator {
  public calculatePowerScore(
    gdp: number,
    treasury: number,
    infantry: number,
    airForce: number,
    drone: number,
    techLevel = 1,
    militaryPowerMultiplier = 1.0,
  ): PowerScoreDetails {
    const economicScore = (gdp + treasury * 0.1) / 1000000000;
    const baseStrength = infantry * 1.0 + airForce * 3.0 + drone * 2.5;
    const militaryScore =
      baseStrength * (1 + (techLevel - 1) * 0.2) * militaryPowerMultiplier;
    return {
      economicScore: Number(economicScore.toFixed(4)),
      militaryScore: Number(militaryScore.toFixed(4)),
      powerScore: Number((economicScore + militaryScore).toFixed(4)),
    };
  }
}

export interface NationRankInput {
  id: string;
  gdp: number;
  treasury: number;
  infantry: number;
  airForce: number;
  drone: number;
  techLevel?: number;
  militaryPowerMultiplier?: number;
}

export interface NationRankOutput {
  id: string;
  score: number;
  rank: number;
}

export class PowerScoreRanker {
  private calculator = new PowerScoreCalculator();

  public rankNations(nations: NationRankInput[]): NationRankOutput[] {
    const scores = nations
      .map((n) => ({
        id: n.id,
        score: this.calculator.calculatePowerScore(
          n.gdp,
          n.treasury,
          n.infantry,
          n.airForce,
          n.drone,
          n.techLevel ?? 1,
          n.militaryPowerMultiplier ?? 1.0,
        ).powerScore,
      }))
      .sort((a, b) => b.score - a.score);

    return scores.map((item, index) => ({
      id: item.id,
      score: item.score,
      rank: index + 1,
    }));
  }
}

export class RelationsManager {
  public calculateGovernmentFriction(nationA: Nation, nationB: Nation): number {
    const typeA = nationA.government.type;
    const typeB = nationB.government.type;
    if (typeA === typeB) return 1;
    if (
      (typeA === "DEMOCRACY" && typeB === "FASCISM") ||
      (typeA === "FASCISM" && typeB === "DEMOCRACY")
    )
      return -3;
    if (
      (typeA === "DEMOCRACY" && typeB === "COMMUNISM") ||
      (typeA === "COMMUNISM" && typeB === "DEMOCRACY")
    )
      return -2;
    return 0;
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
  public evaluateProposal(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
    requestedTributeAmount?: number,
  ): ProposalEvaluation {
    const relation = receiver.relations[sender.id];
    const opinion =
      (relation ? relation.opinion : 0) +
      DoctrinesManager.getDiplomaticOpinionThresholdBonus(
        sender.doctrines?.unlockedDoctrines,
      );

    switch (proposalType) {
      case "SEVER_TRADE_RELATIONS":
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
      case "IMPROVE_RELATIONS":
        if (sender.treasury < (requestedTributeAmount || 10000))
          return { accepted: false, reason: "INSUFFICIENT_SENDER_FUNDS" };
        return opinion >= 40
          ? { accepted: false, reason: "OPINION_ALREADY_HIGH" }
          : { accepted: true };
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
