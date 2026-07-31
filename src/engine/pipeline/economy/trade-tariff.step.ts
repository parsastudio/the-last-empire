import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";

export class TradeTariffStep implements EconomyStep {
  private tariffCalculator = new TariffCalculator();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const tariffResult = this.tariffCalculator.calculateTariffEffects(nation);

      if (tariffResult.tariffRevenue > 0) {
        nations[id] = {
          ...nation,
          treasury: nation.treasury + tariffResult.tariffRevenue,
        };
      }
    }
  }
}
