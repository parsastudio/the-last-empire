import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  TradeResourcesAction,
} from "@/modules/game-engine/schemas/action.schema";
import { MarketEngine } from "@/modules/trade/domain/market-engine";
import { GameError } from "@/core/errors/game-error";
import type { ActionHandler } from "./action-handler";

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
    if (!tradeAction.isBuy) {
      if (nation.resources[tradeAction.resourceType] < tradeAction.amount) {
        throw new GameError(
          "INSUFFICIENT_RESOURCES",
          `Not enough ${tradeAction.resourceType} in stock for transaction`,
        );
      }
    }
    if (tradeAction.isBuy) {
      const result = this.marketEngine.buyResource(
        nation,
        state.marketPrices,
        tradeAction.resourceType,
        tradeAction.amount,
      );
      return {
        ...state,
        marketPrices: result.updatedMarketPrices,
        nations: {
          ...state.nations,
          [action.nationId]: result.updatedNation,
        },
      };
    } else {
      const result = this.marketEngine.sellResource(
        nation,
        state.marketPrices,
        tradeAction.resourceType,
        tradeAction.amount,
      );
      return {
        ...state,
        marketPrices: result.updatedMarketPrices,
        nations: {
          ...state.nations,
          [action.nationId]: result.updatedNation,
        },
      };
    }
  }
}
