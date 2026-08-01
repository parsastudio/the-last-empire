import {
  EconomyStep,
  EconomyStepContext,
} from "@/engine/pipeline/economy/economy-step.interface";
import { TradeTariffStep } from "./trade-tariff.step";
import { MarketPriceStep } from "./market-price.step";
import { AutoTradeEngine } from "@/engine/economy/auto-trade/auto-trade.engine";

export class MarketTradeStepGroup implements EconomyStep {
  private steps: EconomyStep[] = [new TradeTariffStep(), new MarketPriceStep()];
  private autoTradeEngine = new AutoTradeEngine();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    const marketPrices = context.state.marketPrices;

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const autoResult = this.autoTradeEngine.processNationAutoTrade(
        nation,
        marketPrices,
      );

      nations[id] = autoResult.updatedNation;
    }

    for (const step of this.steps) {
      step.execute(context);
    }
  }
}
