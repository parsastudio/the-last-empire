import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { ResearchManager } from "@/engine/politics/research-manager";

export class StabilityDoctrinesHandler {
  private stabilityCalc = new StabilityCalculator();
  private researchManager = new ResearchManager();

  public handle(nation: Nation): Nation {
    let updated = { ...nation };
    const newStability = this.stabilityCalc.calculateTurnStability(updated);

    updated.government = {
      ...updated.government,
      stability: newStability,
    };

    updated = this.researchManager.processTurnResearch(updated);

    return updated;
  }
}
