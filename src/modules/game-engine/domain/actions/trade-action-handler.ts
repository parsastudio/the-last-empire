import type { GameState, GameAction, TradeResourcesAction } from "@/core/types";
import { MarketEngine } from "@/modules/trade/domain/market-engine";
import { ActionHandler } from "./action-handler";

export class TradeActionHandler implements ActionHandler {
  private marketEngine = new MarketEngine();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "TRADE_RESOURCES") {
      return state;
    }
    const tradeAction = action as TradeResourcesAction;
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }

    if (tradeAction.isBuy) {
      const result = this.marketEngine.buyResource(
        nation,
        state.marketPrices,
        tradeAction.resourceType,
        tradeAction.amount,
      );
      state.nations[action.nationId] = result.updatedNation;
      state.marketPrices = result.updatedMarketPrices;
    } else {
      const result = this.marketEngine.sellResource(
        nation,
        state.marketPrices,
        tradeAction.resourceType,
        tradeAction.amount,
      );
      state.nations[action.nationId] = result.updatedNation;
      state.marketPrices = result.updatedMarketPrices;
    }

    return state;
  }
}
