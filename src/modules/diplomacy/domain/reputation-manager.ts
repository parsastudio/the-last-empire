import type { Nation } from "@/modules/nation/schemas/nation.schema";

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
    const newReputation = Math.min(100, nation.globalReputation + gainAmount);
    return {
      ...nation,
      globalReputation: newReputation,
    };
  }

  public canProposeTreaties(nation: Nation): boolean {
    return nation.globalReputation > -70;
  }
}
