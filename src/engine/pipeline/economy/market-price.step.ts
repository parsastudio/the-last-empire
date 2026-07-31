import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { MarketEngine } from "@/engine/economy/market-engine";

export class MarketPriceStep implements EconomyStep {
  private marketEngine = new MarketEngine();

  public execute(context: EconomyStepContext): void {
    const currentOil =
      context.state.marketPrices.oil < 1000000
        ? 25000000
        : context.state.marketPrices.oil;
    const currentSteel =
      context.state.marketPrices.steel < 1000000
        ? 25000000
        : context.state.marketPrices.steel;

    context.state.marketPrices = this.marketEngine.updateMarketPrices(
      { oil: currentOil, steel: currentSteel },
      context.totalOilDemand,
      context.totalOilSupply,
      context.totalSteelDemand,
      context.totalSteelSupply,
    );

    context.state.turnTradeVolume = {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };
  }
}
