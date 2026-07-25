import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { MarketPricingCalculator } from "./market/market-pricing.calculator";
import {
  BuyTransactionHandler,
  TradeTransactionResult,
} from "./market/buy-transaction.handler";
import { SellTransactionHandler } from "./market/sell-transaction.handler";

export class MarketEngine {
  private pricingCalculator = new MarketPricingCalculator();
  private buyHandler = new BuyTransactionHandler();
  private sellHandler = new SellTransactionHandler();

  public updateMarketPrices(
    currentPrices: ResourceMarketPrice,
    totalOilDemand: number,
    totalOilSupply: number,
    totalSteelDemand: number,
    totalSteelSupply: number,
  ): ResourceMarketPrice {
    return this.pricingCalculator.updateMarketPrices(
      currentPrices,
      totalOilDemand,
      totalOilSupply,
      totalSteelDemand,
      totalSteelSupply,
    );
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
