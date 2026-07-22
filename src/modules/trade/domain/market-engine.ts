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

    const unitPrice = marketPrices[resourceType];
    const totalCost = unitPrice * amount;

    if (nation.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to buy resources",
      );
    }

    const updatedNation: Nation = {
      ...nation,
      treasury: nation.treasury - totalCost,
      resources: {
        ...nation.resources,
        [resourceType]: nation.resources[resourceType] + amount,
      },
    };

    const priceIncrease = Math.max(1, Math.floor(amount * 0.1));
    const updatedMarketPrices: ResourceMarketPrice = {
      ...marketPrices,
      [resourceType]: Math.min(
        this.maxPrice,
        marketPrices[resourceType] + priceIncrease,
      ),
    };

    return {
      updatedNation,
      updatedMarketPrices,
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

    const unitPrice = marketPrices[resourceType];
    const totalRevenue = unitPrice * amount;

    const updatedNation: Nation = {
      ...nation,
      treasury: nation.treasury + totalRevenue,
      resources: {
        ...nation.resources,
        [resourceType]: nation.resources[resourceType] - amount,
      },
    };

    const priceDrop = Math.max(1, Math.floor(amount * 0.1));
    const updatedMarketPrices: ResourceMarketPrice = {
      ...marketPrices,
      [resourceType]: Math.max(
        this.minPrice,
        marketPrices[resourceType] - priceDrop,
      ),
    };

    return {
      updatedNation,
      updatedMarketPrices,
      totalCostOrRevenue: totalRevenue,
    };
  }
}
