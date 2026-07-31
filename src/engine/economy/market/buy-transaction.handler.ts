import type { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export interface TradeTransactionResult {
  updatedNation: Nation;
  updatedMarketPrices: ResourceMarketPrice;
  totalCostOrRevenue: number;
}

export class BuyTransactionHandler {
  public predictBuyCost(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) return 0;
    const unitPrice = marketPrices[resourceType] || 25000000;
    return amount * unitPrice;
  }

  public calculateMaxAffordable(
    treasury: number,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
  ): number {
    if (treasury <= 0) return 0;
    const unitPrice = marketPrices[resourceType] || 25000000;
    return Math.floor(treasury / unitPrice);
  }

  public buyResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    if (amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Buy amount must be greater than zero",
      );
    }
    const totalCost = this.predictBuyCost(marketPrices, resourceType, amount);
    if (nation.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to buy resources",
      );
    }

    const updatedNation: Nation = {
      ...nation,
      treasury: nation.treasury - totalCost,
      resources: {
        ...nation.resources,
        [resourceType]: nation.resources[resourceType] + amount,
      },
    };

    return {
      updatedNation,
      updatedMarketPrices: marketPrices,
      totalCostOrRevenue: totalCost,
    };
  }
}
