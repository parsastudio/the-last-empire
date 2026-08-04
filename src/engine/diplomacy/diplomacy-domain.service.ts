import { Nation } from "@/domain/nation/nation.schema";
import {
  DiplomaticStance,
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface BetrayalEvaluation {
  reputationPenalty: number;
  skippedSteps: number;
  hasBetrayed: boolean;
}

export class DiplomaticBetrayalCalculator {
  public calculatePenalty(stance: DiplomaticStance): BetrayalEvaluation {
    if (stance === "ALLIANCE") {
      return {
        reputationPenalty: 50,
        skippedSteps: 2,
        hasBetrayed: true,
      };
    }

    if (stance === "NON_AGGRESSION_PACT") {
      return {
        reputationPenalty: 25,
        skippedSteps: 1,
        hasBetrayed: true,
      };
    }

    return {
      reputationPenalty: 0,
      skippedSteps: 0,
      hasBetrayed: false,
    };
  }
}

export interface CoolOffTransitionResult {
  nextStance: DiplomaticStance;
  turnsRemaining: number;
}

export class CoolOffManager {
  public initiateDowngrade(
    currentStance: DiplomaticStance,
  ): CoolOffTransitionResult {
    if (currentStance === "ALLIANCE") {
      return { nextStance: "NON_AGGRESSION_PACT", turnsRemaining: 1 };
    }
    if (currentStance === "NON_AGGRESSION_PACT") {
      return { nextStance: "NORMAL_DIPLOMACY", turnsRemaining: 1 };
    }
    if (currentStance === "SEVERED_RELATIONS" || currentStance === "WAR") {
      return { nextStance: "NORMAL_DIPLOMACY", turnsRemaining: 2 };
    }
    return { nextStance: "NORMAL_DIPLOMACY", turnsRemaining: 0 };
  }

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
    let stanceModifier = 0;
    if (isLandNeighbor) {
      stanceModifier -= 10;
    }

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
      case "NORMAL_DIPLOMACY":
      default:
        break;
    }

    const baseline = globalReputation + stanceModifier + govFrictionValue * 5;
    const target = Math.max(-100, Math.min(100, baseline));
    const nextOpinion = currentOpinion + (target - currentOpinion) * 0.2;
    return Math.max(-100, Math.min(100, Math.round(nextOpinion)));
  }
}

export interface PowerScoreDetails {
  economicScore: number;
  militaryScore: number;
  powerScore: number;
}

export class PowerScoreCalculator {
  public calculateEconomicScore(gdp: number, treasury: number): number {
    const rawEco = gdp + treasury * 0.1;
    return rawEco / 1000000000;
  }

  public calculateMilitaryScore(
    infantry: number,
    airForce: number,
    drone: number,
    techLevel = 1,
    militaryPowerMultiplier = 1.0,
  ): number {
    const baseStrength = infantry * 1.0 + airForce * 3.0 + drone * 2.5;
    const techMultiplier = 1 + (techLevel - 1) * 0.2;
    return baseStrength * techMultiplier * militaryPowerMultiplier;
  }

  public calculatePowerScore(
    gdp: number,
    treasury: number,
    infantry: number,
    airForce: number,
    drone: number,
    techLevel = 1,
    militaryPowerMultiplier = 1.0,
  ): PowerScoreDetails {
    const economicScore = this.calculateEconomicScore(gdp, treasury);
    const militaryScore = this.calculateMilitaryScore(
      infantry,
      airForce,
      drone,
      techLevel,
      militaryPowerMultiplier,
    );
    const powerScore = Number((economicScore + militaryScore).toFixed(4));
    return {
      economicScore: Number(economicScore.toFixed(4)),
      militaryScore: Number(militaryScore.toFixed(4)),
      powerScore,
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
    const scores = nations.map((n) => {
      const details = this.calculator.calculatePowerScore(
        n.gdp,
        n.treasury,
        n.infantry,
        n.airForce,
        n.drone,
        n.techLevel ?? 1,
        n.militaryPowerMultiplier ?? 1.0,
      );
      return {
        id: n.id,
        score: details.powerScore,
      };
    });

    scores.sort((a, b) => b.score - a.score);

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
    ) {
      return -3;
    }

    if (
      (typeA === "DEMOCRACY" && typeB === "COMMUNISM") ||
      (typeA === "COMMUNISM" && typeB === "DEMOCRACY")
    ) {
      return -2;
    }

    return 0;
  }

  public improveRelations(
    nationA: Nation,
    targetId: string,
    cost = 10000,
  ): Nation {
    if (nationA.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to improve relations",
      );
    }

    const relation = nationA.relations[targetId];
    if (!relation) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `Target nation ${targetId} relation not found`,
      );
    }

    return {
      ...nationA,
      treasury: nationA.treasury - cost,
      relations: {
        ...nationA.relations,
        [targetId]: {
          ...relation,
          opinion: Math.min(100, relation.opinion + 15),
        },
      },
    };
  }
}

export class ReputationManager {
  public applyReputationPenalty(nation: Nation, penaltyAmount: number): Nation {
    const newReputation = Math.max(
      -100,
      nation.globalReputation - penaltyAmount,
    );
    return {
      ...nation,
      globalReputation: newReputation,
    };
  }

  public applyReputationGain(nation: Nation, gainAmount: number): Nation {
    const multiplier = DoctrinesManager.getReputationGainMultiplier(
      nation.doctrines.unlockedDoctrines,
    );
    const newReputation = Math.min(
      100,
      nation.globalReputation + gainAmount * multiplier,
    );
    return {
      ...nation,
      globalReputation: newReputation,
    };
  }

  public canProposeTreaties(nation: Nation): boolean {
    return nation.globalReputation > -70;
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
    let opinion = relation ? relation.opinion : 0;

    const thresholdBonus = DoctrinesManager.getDiplomaticOpinionThresholdBonus(
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
