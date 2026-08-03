import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MARKET_CONFIG } from "@/domain/economy/market.config";

export interface TradeTransactionResult {
  updatedNation: Nation;
  updatedMarketPrices: ResourceMarketPrice;
  totalCostOrRevenue: number;
}

export class MarketEngine {
  public updateMarketPrices(): ResourceMarketPrice {
    return {
      oil: MARKET_CONFIG.FIXED_BUY_PRICE,
      steel: MARKET_CONFIG.FIXED_BUY_PRICE,
    };
  }

  public predictBuyCost(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) return 0;
    const unitPrice =
      marketPrices[resourceType] || MARKET_CONFIG.FIXED_BUY_PRICE;
    return amount * unitPrice;
  }

  public calculateMaxAffordable(
    treasury: number,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
  ): number {
    if (treasury <= 0) return 0;
    const unitPrice =
      marketPrices[resourceType] || MARKET_CONFIG.FIXED_BUY_PRICE;
    return Math.floor(treasury / unitPrice);
  }

  public predictSellRevenue(
    _marketPrices: ResourceMarketPrice,
    _resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) return 0;
    return amount * MARKET_CONFIG.FIXED_SELL_PRICE;
  }

  public buyResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    if (amount <= 0) {
      throw new GameError("INVALID_ACTION", "Buy amount must be positive");
    }
    const totalCost = this.predictBuyCost(marketPrices, resourceType, amount);
    if (nation.treasury < totalCost) {
      throw new GameError("INSUFFICIENT_FUNDS", "Insufficient treasury");
    }

    return {
      updatedNation: {
        ...nation,
        treasury: nation.treasury - totalCost,
        resources: {
          ...nation.resources,
          [resourceType]: nation.resources[resourceType] + amount,
        },
      },
      updatedMarketPrices: marketPrices,
      totalCostOrRevenue: totalCost,
    };
  }

  public sellResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    if (amount <= 0) {
      throw new GameError("INVALID_ACTION", "Sell amount must be positive");
    }
    if (nation.resources[resourceType] < amount) {
      throw new GameError("INSUFFICIENT_RESOURCES", "Insufficient stock");
    }

    const totalRevenue = this.predictSellRevenue(
      marketPrices,
      resourceType,
      amount,
    );

    return {
      updatedNation: {
        ...nation,
        treasury: nation.treasury + totalRevenue,
        resources: {
          ...nation.resources,
          [resourceType]: nation.resources[resourceType] - amount,
        },
      },
      updatedMarketPrices: marketPrices,
      totalCostOrRevenue: totalRevenue,
    };
  }
}
