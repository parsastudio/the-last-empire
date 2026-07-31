import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { PopulationGrowthEngine } from "@/engine/economy/population-growth-engine";

export class PopulationUpdateStep implements EconomyStep {
  private popEngine = new PopulationGrowthEngine();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const population = this.popEngine.updatePopulation(nation);

      nations[id] = {
        ...nation,
        population,
      };
    }
  }
}
