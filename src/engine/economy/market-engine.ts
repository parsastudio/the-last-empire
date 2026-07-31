import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { MarketPricingCalculator } from "@/engine/economy/market/market-pricing.calculator";
import {
  BuyTransactionHandler,
  TradeTransactionResult,
} from "@/engine/economy/market/buy-transaction.handler";
import { SellTransactionHandler } from "@/engine/economy/market/sell-transaction.handler";

export class MarketEngine {
  private pricingCalculator = new MarketPricingCalculator();
  private buyHandler = new BuyTransactionHandler();
  private sellHandler = new SellTransactionHandler();

  public updateMarketPrices(): ResourceMarketPrice {
    return this.pricingCalculator.updateMarketPrices();
  }

  public predictBuyCost(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    return this.buyHandler.predictBuyCost(marketPrices, resourceType, amount);
  }

  public calculateMaxAffordable(
    treasury: number,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
  ): number {
    return this.buyHandler.calculateMaxAffordable(
      treasury,
      marketPrices,
      resourceType,
    );
  }

  public predictSellRevenue(
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): number {
    return this.sellHandler.predictSellRevenue(
      marketPrices,
      resourceType,
      amount,
    );
  }

  public buyResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    return this.buyHandler.buyResource(
      nation,
      marketPrices,
      resourceType,
      amount,
    );
  }

  public sellResource(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
    resourceType: "oil" | "steel",
    amount: number,
  ): TradeTransactionResult {
    return this.sellHandler.sellResource(
      nation,
      marketPrices,
      resourceType,
      amount,
    );
  }
}
