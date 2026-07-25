import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";
import { TradeTransactionResult } from "./buy-transaction.handler";

export class SellTransactionHandler {
  private readonly minPrice = 10;
  private readonly feeRate = 0.1;
  private readonly sellSpread = 0.85;

  public predictSellRevenue(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) {
      return 0;
    }
    const currentPrice = marketPrices[resourceType];
    const adjustedStartPrice = Math.max(
      this.minPrice,
      Math.floor(currentPrice * this.sellSpread),
    );
    const k = adjustedStartPrice - this.minPrice;
    let totalRevenue = 0;
    if (amount <= k) {
      totalRevenue = amount * adjustedStartPrice - (amount * (amount - 1)) / 2;
    } else {
      const variableRevenue = k * adjustedStartPrice - (k * (k - 1)) / 2;
      const flatRevenue = (amount - k) * this.minPrice;
      totalRevenue = variableRevenue + flatRevenue;
    }
    const fee = Math.floor(totalRevenue * this.feeRate);
    return Math.max(0, totalRevenue - fee);
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
    const adjustedStartPrice = Math.max(
      this.minPrice,
      Math.floor(currentPrice * this.sellSpread),
    );
    const k = adjustedStartPrice - this.minPrice;
    const finalPrice =
      amount <= k
        ? adjustedStartPrice - Math.max(1, Math.floor(amount * 0.5))
        : this.minPrice;

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
      [resourceType]: finalPrice,
    };
    return {
      updatedNation,
      updatedMarketPrices,
      totalCostOrRevenue: netRevenue,
    };
  }
}
