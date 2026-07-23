import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { DoctrinesManager } from "@/modules/politics/domain/doctrines-manager";

export class ReputationManager {
  private doctrinesManager = new DoctrinesManager();

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
    const multiplier = this.doctrinesManager.getReputationGainMultiplier(
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
