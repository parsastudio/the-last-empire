import { Nation } from "@/domain/nation/nation.schema";
import { ElectionEngine } from "@/engine/politics/election-engine";
import { DomesticCrisisManager } from "@/engine/politics/domestic-crisis-manager";

export class ElectionCrisisHandler {
  private electionEngine = new ElectionEngine();
  private domesticCrisisManager = new DomesticCrisisManager();

  public handle(
    nation: Nation,
    currentTurn: number,
    prngNextInt: number,
  ): { updated: Nation; coupOrCrisisTriggered: boolean } {
    let updated = { ...nation };

    const electionResult = this.electionEngine.processElection(
      updated,
      currentTurn,
      prngNextInt,
    );
    if (electionResult.electionHeld) {
      updated = electionResult.updatedNation;
    }

    const crisisResult =
      this.domesticCrisisManager.checkAndProcessCrisis(updated);
    updated = crisisResult.updatedNation;

    return {
      updated,
      coupOrCrisisTriggered: crisisResult.status === "COUP",
    };
  }
}
