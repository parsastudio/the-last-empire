import type { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export interface TradeTransactionResult {
  updatedNation: Nation;
  updatedMarketPrices: ResourceMarketPrice;
  totalCostOrRevenue: number;
}

export class BuyTransactionHandler {
  private readonly maxPrice = 1000;
  private readonly feeRate = 0.1;

  public calculateSlippageFactor(amount: number): number {
    if (amount <= 0) return 0;
    return Math.min(0.25, (amount / (amount + 500000)) * 0.25);
  }

  public predictBuyCost(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) {
      return 0;
    }
    const currentPrice = marketPrices[resourceType];
    const slippage = this.calculateSlippageFactor(amount);
    const avgUnitPrice = Math.min(
      this.maxPrice,
      currentPrice * (1.0 + slippage),
    );
    const grossCost = amount * avgUnitPrice;
    const fee = Math.floor(grossCost * this.feeRate);
    return Math.floor(grossCost + fee);
  }

  public calculateMaxAffordable(
    treasury: number,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
  ): number {
    if (treasury <= 0) {
      return 0;
    }
    let low = 0;
    let high = 10000000000;
    let result = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cost = this.predictBuyCost(marketPrices, resourceType, mid);
      if (cost <= treasury) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
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
    const totalCostWithFee = this.predictBuyCost(
      marketPrices,
      resourceType,
      amount,
    );
    if (nation.treasury < totalCostWithFee) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to buy resources",
      );
    }
    const currentPrice = marketPrices[resourceType];
    const slippage = this.calculateSlippageFactor(amount);
    const newPrice = Math.min(
      this.maxPrice,
      Math.floor(currentPrice * (1.0 + slippage)),
    );

    const updatedNation: Nation = {
      ...nation,
      treasury: nation.treasury - totalCostWithFee,
      resources: {
        ...nation.resources,
        [resourceType]: nation.resources[resourceType] + amount,
      },
    };
    const updatedMarketPrices: ResourceMarketPrice = {
      ...marketPrices,
      [resourceType]: newPrice,
    };
    return {
      updatedNation,
      updatedMarketPrices,
      totalCostOrRevenue: totalCostWithFee,
    };
  }
}
