import {
  EconomyStep,
  EconomyStepContext,
} from "@/engine/pipeline/economy/economy-step.interface";
import { MarketEngine } from "@/engine/economy/market-engine";

export class MarketPriceStep implements EconomyStep {
  private marketEngine = new MarketEngine();

  public execute(context: EconomyStepContext): void {
    context.state.marketPrices = this.marketEngine.updateMarketPrices();

    context.state.turnTradeVolume = {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };
  }
}
