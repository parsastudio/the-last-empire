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
  public static updateMarketPrices(): ResourceMarketPrice {
    return {
      oil: MARKET_CONFIG.FIXED_BUY_PRICE,
      steel: MARKET_CONFIG.FIXED_BUY_PRICE,
    };
  }

  public static predictBuyCost(
    _marketPrices: ResourceMarketPrice,
    _resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) return 0;
    return amount * MARKET_CONFIG.FIXED_BUY_PRICE;
  }

  public static calculateMaxAffordable(
    treasury: number,
    _marketPrices: ResourceMarketPrice,
    _resourceType: "oil" | "steel",
  ): number {
    if (treasury <= 0) return 0;
    return Math.floor(treasury / MARKET_CONFIG.FIXED_BUY_PRICE);
  }

  public static predictSellRevenue(
    _marketPrices: ResourceMarketPrice,
    _resourceType: "oil" | "steel",
    amount: number,
  ): number {
    if (amount <= 0) return 0;
    return amount * MARKET_CONFIG.FIXED_SELL_PRICE;
  }

  public static buyResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    if (amount <= 0) {
      throw new GameError("INVALID_ACTION", "تعداد سفارش خرید باید مثبت باشد.");
    }
    const totalCost = MarketEngine.predictBuyCost(
      marketPrices,
      resourceType,
      amount,
    );
    if (nation.treasury < totalCost) {
      throw new GameError("INSUFFICIENT_FUNDS", "موجودی خزانه کافی نیست.");
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
      updatedMarketPrices: {
        oil: MARKET_CONFIG.FIXED_BUY_PRICE,
        steel: MARKET_CONFIG.FIXED_BUY_PRICE,
      },
      totalCostOrRevenue: totalCost,
    };
  }

  public static sellResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    if (amount <= 0) {
      throw new GameError("INVALID_ACTION", "تعداد سفارش فروش باید مثبت باشد.");
    }
    if (nation.resources[resourceType] < amount) {
      throw new GameError("INSUFFICIENT_RESOURCES", "موجودی انبار کافی نیست.");
    }

    const totalRevenue = MarketEngine.predictSellRevenue(
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
      updatedMarketPrices: {
        oil: MARKET_CONFIG.FIXED_BUY_PRICE,
        steel: MARKET_CONFIG.FIXED_BUY_PRICE,
      },
      totalCostOrRevenue: totalRevenue,
    };
  }
}
