import type { ResourceMarketPrice } from "@/modules/economy/schemas/economy.schema";
import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { GameError } from "@/core/errors/game-error";

export interface TradeTransactionResult {
  updatedNation: Nation;
  updatedMarketPrices: ResourceMarketPrice;
  totalCostOrRevenue: number;
}

export class MarketEngine {
  private readonly minPrice = 10;
  private readonly maxPrice = 500;
  private readonly feeRate = 0.1;
  private readonly sellSpread = 0.85;

  public updateMarketPrices(
    currentPrices: ResourceMarketPrice,
    totalOilDemand: number,
    totalOilSupply: number,
    totalSteelDemand: number,
    totalSteelSupply: number,
  ): ResourceMarketPrice {
    const oilBalance = totalOilDemand - totalOilSupply;
    const steelBalance = totalSteelDemand - totalSteelSupply;
    const oilDelta = Math.floor(oilBalance * 0.5);
    const steelDelta = Math.floor(steelBalance * 0.5);
    const newOilPrice = Math.max(
      this.minPrice,
      Math.min(this.maxPrice, currentPrices.oil + oilDelta),
    );
    const newSteelPrice = Math.max(
      this.minPrice,
      Math.min(this.maxPrice, currentPrices.steel + steelDelta),
    );
    return {
      oil: newOilPrice,
      steel: newSteelPrice,
    };
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
      totalRevenue = k * adjustedStartPrice - (k * (k - 1)) / 2;
    }
    const fee = Math.floor(totalRevenue * this.feeRate);
    return Math.max(0, totalRevenue - fee);
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
    const finalPrice = amount <= k ? currentPrice + amount : this.maxPrice;

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
      amount <= k ? adjustedStartPrice - amount : this.minPrice;

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
