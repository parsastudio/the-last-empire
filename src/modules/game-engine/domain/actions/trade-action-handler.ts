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

    const currentVolume = state.turnTradeVolume ?? {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };

    const updatedVolume = { ...currentVolume };
    if (tradeAction.resourceType === "oil") {
      if (tradeAction.isBuy) {
        updatedVolume.oilBought += tradeAction.amount;
      } else {
        updatedVolume.oilSold += tradeAction.amount;
      }
    } else if (tradeAction.resourceType === "steel") {
      if (tradeAction.isBuy) {
        updatedVolume.steelBought += tradeAction.amount;
      } else {
        updatedVolume.steelSold += tradeAction.amount;
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
        turnTradeVolume: updatedVolume,
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
        turnTradeVolume: updatedVolume,
        nations: {
          ...state.nations,
          [action.nationId]: result.updatedNation,
        },
      };
    }
  }
}
