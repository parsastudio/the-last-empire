import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { ManpowerManager } from "@/engine/economy/manpower-manager";

export class ManpowerGrowthStep implements EconomyStep {
  private manpowerManager = new ManpowerManager();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const growth = this.manpowerManager.calculateGrowth(nation);
      nations[id] = this.manpowerManager.restoreManpower(nation, growth);
    }
  }
}
