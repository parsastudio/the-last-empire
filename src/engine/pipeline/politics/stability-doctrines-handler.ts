import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export class StabilityDoctrinesHandler {
  private stabilityCalc = new StabilityCalculator();

  public handle(nation: Nation): Nation {
    const updated = { ...nation };
    const newStability = this.stabilityCalc.calculateTurnStability(updated);

    updated.government = {
      ...updated.government,
      stability: newStability,
    };

    const pointsEarned = 0.1 + (newStability / 100) * 0.1;
    updated.doctrines = {
      ...updated.doctrines,
      doctrinePoints: Number(
        (updated.doctrines.doctrinePoints + pointsEarned).toFixed(2),
      ),
    };

    return updated;
  }
}
