import { Nation } from "@/domain/nation/nation.schema";
import {
  CrisisStatusEvaluator,
  CrisisStatus,
} from "./crisis/crisis-status.evaluator";
import { RevoltCoupHandler } from "./crisis/revolt-coup.handler";

export interface DomesticCrisisResult {
  hasTriggered: boolean;
  status: CrisisStatus;
  updatedNation: Nation;
}

export class DomesticCrisisManager {
  private evaluator = new CrisisStatusEvaluator();
  private handler = new RevoltCoupHandler();

  public checkAndProcessCrisis(nation: Nation): DomesticCrisisResult {
    const { status, rebelStrength } =
      this.evaluator.evaluateCrisisStatus(nation);

    switch (status) {
      case "COUP":
        return {
          hasTriggered: true,
          status,
          updatedNation: this.handler.applyCoup(nation),
        };
      case "REVOLT":
        return {
          hasTriggered: true,
          status,
          updatedNation: this.handler.applyRebellion(nation, rebelStrength),
        };
      case "CRISIS":
        return {
          hasTriggered: true,
          status,
          updatedNation: this.handler.applyCrisisPenalty(nation),
        };
      case "RESTLESS":
        return {
          hasTriggered: true,
          status,
          updatedNation: nation,
        };
      default:
        return {
          hasTriggered: false,
          status,
          updatedNation: nation,
        };
    }
  }
}
