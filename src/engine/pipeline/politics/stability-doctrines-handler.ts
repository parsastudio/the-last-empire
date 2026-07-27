import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { TraitManager } from "@/engine/politics/trait-manager";

export class StabilityDoctrinesHandler {
  private stabilityCalc = new StabilityCalculator();
  private traitManager = new TraitManager();

  public handle(nation: Nation): Nation {
    const updated = { ...nation };
    let stability = this.stabilityCalc.calculateTurnStability(updated);
    stability = Math.max(
      0,
      Math.min(
        100,
        stability + this.traitManager.getBaseStabilityDelta(updated),
      ),
    );
    updated.government.stability = stability;

    const pointsEarned = 0.1 + (stability / 100) * 0.1;
    updated.doctrines.doctrinePoints = Number(
      (updated.doctrines.doctrinePoints + pointsEarned).toFixed(2),
    );

    return updated;
  }
}
