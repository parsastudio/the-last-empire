import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { OverextensionCalculator } from "@/engine/economy/overextension-calculator";

export class AdminBurdenStep implements EconomyStep {
  private overextensionCalculator = new OverextensionCalculator();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      nations[id] = {
        ...nation,
        adminBurdenMultiplier:
          this.overextensionCalculator.calculateOverextension(nation),
      };
    }
  }
}
