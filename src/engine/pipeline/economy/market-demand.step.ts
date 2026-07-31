import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

export class MarketDemandStep implements EconomyStep {
  private popWelfareCalc = new PopulationWelfareCalculator();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const nation of Object.values(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const welfareMetrics = this.popWelfareCalc.evaluateWelfare(
        nation.population,
        nation.resources.oil,
        nation.resources.steel,
        nation.gdp,
      );

      context.totalOilDemand += welfareMetrics.oilDemand;
      context.totalSteelDemand += welfareMetrics.steelDemand;
    }
  }
}
