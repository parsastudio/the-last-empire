import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export interface TradeTransactionResult {
  updatedNation: Nation;
  updatedMarketPrices: ResourceMarketPrice;
  totalCostOrRevenue: number;
}

export class BuyTransactionHandler {
  private readonly maxPrice = 500;
  private readonly feeRate = 0.1;

  public predictBuyCost(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) {
      return 0;
    }
    const currentPrice = marketPrices[resourceType];
    const k = this.maxPrice - currentPrice;
    let totalCost = 0;
    if (amount <= k) {
      totalCost = amount * currentPrice + (amount * (amount - 1)) / 2;
    } else {
      const variableCost = k * currentPrice + (k * (k - 1)) / 2;
      const flatCost = (amount - k) * this.maxPrice;
      totalCost = variableCost + flatCost;
    }
    const fee = Math.floor(totalCost * this.feeRate);
    return totalCost + fee;
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
    let high = 1000000;
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
    const k = this.maxPrice - currentPrice;
    const finalPrice =
      amount <= k
        ? currentPrice + Math.max(1, Math.floor(amount * 0.5))
        : this.maxPrice;

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
      [resourceType]: finalPrice,
    };
    return {
      updatedNation,
      updatedMarketPrices,
      totalCostOrRevenue: totalCostWithFee,
    };
  }
}
