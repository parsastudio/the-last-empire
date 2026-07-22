import type { Nation } from "@/core/types";

export class ReputationManager {
  public applyReputationPenalty(nation: Nation, penaltyAmount: number): Nation {
    const newReputation = Math.max(-100, nation.reputation - penaltyAmount);
    return {
      ...nation,
      reputation: newReputation,
    };
  }

  public applyReputationGain(nation: Nation, gainAmount: number): Nation {
    const newReputation = Math.min(100, nation.reputation + gainAmount);
    return {
      ...nation,
      reputation: newReputation,
    };
  }

  public canProposeTreaties(nation: Nation): boolean {
    return nation.reputation > -70;
  }
}
