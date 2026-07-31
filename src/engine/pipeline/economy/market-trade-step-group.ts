import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { MarketDemandStep } from "./market-demand.step";
import { TradeTariffStep } from "./trade-tariff.step";
import { MarketPriceStep } from "./market-price.step";

export class MarketTradeStepGroup implements EconomyStep {
  private steps: EconomyStep[] = [
    new MarketDemandStep(),
    new TradeTariffStep(),
    new MarketPriceStep(),
  ];

  public execute(context: EconomyStepContext): void {
    for (const step of this.steps) {
      step.execute(context);
    }
  }
}
