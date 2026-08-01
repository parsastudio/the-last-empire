import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

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
