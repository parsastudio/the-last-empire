import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { MarketPriceStep } from "./market-price.step";

export class MarketTradeStepGroup implements EconomyStep {
  private steps: EconomyStep[] = [new MarketPriceStep()];

  public execute(context: EconomyStepContext): void {
    for (const step of this.steps) {
      step.execute(context);
    }
  }
}
