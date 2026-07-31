import type { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";
import type { TradeTransactionResult } from "./buy-transaction.handler";

export class SellTransactionHandler {
  private readonly minPrice = 10;
  private readonly feeRate = 0.1;

  public calculateSlippageFactor(amount: number): number {
    if (amount <= 0) return 0;
    return Math.min(0.2, (amount / (amount + 500000)) * 0.2);
  }

  public predictSellRevenue(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) {
      return 0;
    }
    const currentPrice = marketPrices[resourceType];
    const slippage = this.calculateSlippageFactor(amount);
    const avgUnitPrice = Math.max(
      this.minPrice,
      currentPrice * (1.0 - slippage),
    );
    const grossRevenue = amount * avgUnitPrice;
    const fee = Math.floor(grossRevenue * this.feeRate);
    return Math.max(0, Math.floor(grossRevenue - fee));
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
        `Not enough ${resourceType} to sell`,
      );
    }
    const netRevenue = this.predictSellRevenue(
      marketPrices,
      resourceType,
      amount,
    );
    const currentPrice = marketPrices[resourceType];
    const slippage = this.calculateSlippageFactor(amount);
    const newPrice = Math.max(
      this.minPrice,
      Math.floor(currentPrice * (1.0 - slippage)),
    );

    const updatedNation: Nation = {
      ...nation,
      treasury: nation.treasury + netRevenue,
      resources: {
        ...nation.resources,
        [resourceType]: nation.resources[resourceType] - amount,
      },
    };
    const updatedMarketPrices: ResourceMarketPrice = {
      ...marketPrices,
      [resourceType]: newPrice,
    };
    return {
      updatedNation,
      updatedMarketPrices,
      totalCostOrRevenue: netRevenue,
    };
  }
}
