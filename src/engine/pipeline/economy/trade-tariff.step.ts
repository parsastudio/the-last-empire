import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { TradeRouteManager } from "@/engine/economy/trade-route-manager";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";

export class TradeTariffStep implements EconomyStep {
  private tradeRouteManager = new TradeRouteManager();
  private tariffCalculator = new TariffCalculator();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const totalTradeValue = this.tradeRouteManager.calculateTotalTradeRevenue(
        nation,
        nations,
      );
      const tariffResult = this.tariffCalculator.calculateTariffEffects(
        nation,
        totalTradeValue,
      );

      if (tariffResult.tariffRevenue > 0) {
        nations[id] = {
          ...nation,
          treasury: nation.treasury + tariffResult.tariffRevenue,
        };
      }
    }
  }
}
