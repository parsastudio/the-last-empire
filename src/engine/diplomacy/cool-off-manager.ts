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
