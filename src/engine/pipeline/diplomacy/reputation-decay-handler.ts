import { Nation } from "@/domain/nation/nation.schema";
import { ReputationManager } from "@/engine/diplomacy/reputation-manager";

export class ReputationDecayHandler {
  private reputationManager = new ReputationManager();

  public handle(nation: Nation): Nation {
    let updated = { ...nation };

    if (updated.globalReputation < 0) {
      updated = this.reputationManager.applyReputationGain(updated, 2);
    } else if (updated.globalReputation > 0) {
      updated = {
        ...updated,
        globalReputation: Math.max(0, updated.globalReputation - 1),
      };
    }

    return updated;
  }
}
