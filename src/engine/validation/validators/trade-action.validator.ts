import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, TradeResourcesAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";
import { MarketEngine } from "@/engine/economy/market-engine";

export class TradeActionValidator implements ActionValidator {
  private marketEngine = new MarketEngine();

  public supports(actionType: string): boolean {
    return actionType === "TRADE_RESOURCES";
  }

  public validate(state: GameState, action: GameAction): void {
    const tradeAction = action as TradeResourcesAction;
    if (tradeAction.amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Trade resource amount must be positive",
      );
    }

    const sourceNation = state.nations[action.nationId];
    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Nation does not exist");
    }

    if (tradeAction.isBuy) {
      const estimatedCost = this.marketEngine.predictBuyCost(
        state.marketPrices,
        tradeAction.resourceType,
        tradeAction.amount,
      );
      if (sourceNation.treasury < estimatedCost) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          `Insufficient treasury to buy ${tradeAction.amount} ${tradeAction.resourceType}. Required: ${estimatedCost}`,
        );
      }
    } else {
      const availableStock = sourceNation.resources[tradeAction.resourceType];
      if (availableStock < tradeAction.amount) {
        throw new GameError(
          "INSUFFICIENT_RESOURCES",
          `Insufficient ${tradeAction.resourceType} in national stock to sell. Available: ${availableStock}`,
        );
      }
    }
  }
}
