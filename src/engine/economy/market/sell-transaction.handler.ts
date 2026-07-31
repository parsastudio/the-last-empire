import type { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";
import type { TradeTransactionResult } from "./buy-transaction.handler";

export class SellTransactionHandler {
  public predictSellRevenue(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) return 0;
    const buyPrice = marketPrices[resourceType] || 25000000;
    const sellUnitPrice = Math.floor(buyPrice * (2 / 3));
    return amount * sellUnitPrice;
  }

  public sellResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    if (amount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Sell amount must be greater than zero",
      );
    }
    if (nation.resources[resourceType] < amount) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        `Not enough ${resourceType} in stock to sell`,
      );
    }

    const totalRevenue = this.predictSellRevenue(
      marketPrices,
      resourceType,
      amount,
    );

    const updatedNation: Nation = {
      ...nation,
      treasury: nation.treasury + totalRevenue,
      resources: {
        ...nation.resources,
        [resourceType]: nation.resources[resourceType] - amount,
      },
    };

    return {
      updatedNation,
      updatedMarketPrices: marketPrices,
      totalCostOrRevenue: totalRevenue,
    };
  }
}
