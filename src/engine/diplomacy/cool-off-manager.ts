import type { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

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
      return { nextStance: "PEACE", turnsRemaining: 1 };
    }
    return { nextStance: "PEACE", turnsRemaining: 0 };
  }

  public processTurnTick(turnsRemaining: number): number {
    return Math.max(0, turnsRemaining - 1);
  }
}
