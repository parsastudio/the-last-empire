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
      const isMartialLawActive = nation.activeModifiers.some(
        (m) => m.id === "martial-law-active",
      );
      let warExhaustion = nation.warExhaustion;
      if (isMartialLawActive) {
        warExhaustion = Math.min(100, warExhaustion + 5);
      }

      const population = this.popEngine.updatePopulation(nation);

      let stability = nation.government.stability;
      const density = population / (nation.geography.territorySize || 1);
      if (density > 1500) {
        stability = Math.max(0, stability - 2);
      }

      nations[id] = {
        ...nation,
        warExhaustion,
        population,
        government: {
          ...nation.government,
          stability,
        },
      };
    }
  }
}
