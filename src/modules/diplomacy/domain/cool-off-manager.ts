import type { DiplomaticStance } from "../schemas/diplomacy.schema";

export interface CoolOffTransitionResult {
  nextStance: DiplomaticStance;
  turnsRemaining: number;
}

export interface ViolationPenalties {
  stabilityPenalty: number;
  reputationPenalty: number;
}

export class CoolOffManager {
  public initiateDowngrade(
    currentStance: DiplomaticStance,
  ): CoolOffTransitionResult {
    if (currentStance === "ALLIANCE") {
      return { nextStance: "NON_AGGRESSION_PACT", turnsRemaining: 1 };
    }
    if (currentStance === "NON_AGGRESSION_PACT") {
      return { nextStance: "PEACE", turnsRemaining: 1 };
    }
    return { nextStance: "PEACE", turnsRemaining: 0 };
  }

  public processTurnTick(turnsRemaining: number): number {
    return Math.max(0, turnsRemaining - 1);
  }

  public checkViolation(
    currentStance: DiplomaticStance,
    actionType: "ATTACK" | "DECLARE_WAR",
  ): ViolationPenalties {
    if (
      (actionType === "ATTACK" || actionType === "DECLARE_WAR") &&
      currentStance === "ALLIANCE"
    ) {
      return { stabilityPenalty: 40, reputationPenalty: 50 };
    }
    if (
      (actionType === "ATTACK" || actionType === "DECLARE_WAR") &&
      currentStance === "NON_AGGRESSION_PACT"
    ) {
      return { stabilityPenalty: 20, reputationPenalty: 30 };
    }
    return { stabilityPenalty: 0, reputationPenalty: 0 };
  }
}
