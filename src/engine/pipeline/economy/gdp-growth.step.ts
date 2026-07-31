import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { GdpCalculator } from "@/engine/economy/gdp-calculator";

export class GdpGrowthStep implements EconomyStep {
  private gdpCalc = new GdpCalculator();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const updatedGdp = this.gdpCalc.updateNationGdp(nation);

      nations[id] = {
        ...nation,
        gdp: updatedGdp,
      };
    }
  }
}
