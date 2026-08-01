import {
  EconomyStep,
  EconomyStepContext,
} from "@/engine/pipeline/economy/economy-step.interface";
import { AutoTradeEngine } from "@/engine/economy/auto-trade/auto-trade.engine";

export class AutoTradeStep implements EconomyStep {
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
  }
}
