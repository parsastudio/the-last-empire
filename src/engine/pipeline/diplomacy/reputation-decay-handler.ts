import { Nation } from "@/domain/nation/nation.schema";
import { ReputationManager } from "@/engine/diplomacy/reputation-manager";

export class ReputationDecayHandler {
  private reputationManager = new ReputationManager();

  public handle(nation: Nation): Nation {
    return this.reputationManager.applyReputationGain(nation, 2);
  }
}
