import { Nation } from "@/domain/nation/nation.schema";
import { DomesticCrisisManager } from "@/engine/politics/domestic-crisis-manager";

export class DomesticCrisisHandler {
  private domesticCrisisManager = new DomesticCrisisManager();

  public handle(nation: Nation): {
    updated: Nation;
    coupOrCrisisTriggered: boolean;
  } {
    const crisisResult =
      this.domesticCrisisManager.checkAndProcessCrisis(nation);

    return {
      updated: crisisResult.updatedNation,
      coupOrCrisisTriggered: crisisResult.status === "COUP",
    };
  }
}
