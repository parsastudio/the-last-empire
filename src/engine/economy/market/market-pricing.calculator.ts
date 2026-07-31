import { ResourceMarketPrice } from "@/domain/economy/economy.schema";

export class MarketPricingCalculator {
  private readonly basePrice = 25000000;
  private readonly minPrice = 5000000;
  private readonly maxPrice = 100000000;

  public updateMarketPrices(
    currentPrices: ResourceMarketPrice,
    totalOilDemand: number,
    totalOilSupply: number,
    totalSteelDemand: number,
    totalSteelSupply: number,
  ): ResourceMarketPrice {
    const safeOil =
      currentPrices.oil < 1000000 ? this.basePrice : currentPrices.oil;
    const safeSteel =
      currentPrices.steel < 1000000 ? this.basePrice : currentPrices.steel;

    const oilBalance = totalOilDemand - totalOilSupply;
    const steelBalance = totalSteelDemand - totalSteelSupply;

    const rawOilDelta = Math.floor(oilBalance * 500000);
    const rawSteelDelta = Math.floor(steelBalance * 500000);

    const oilGravity = Math.floor((this.basePrice - safeOil) * 0.05);
    const steelGravity = Math.floor((this.basePrice - safeSteel) * 0.05);

    const oilDelta = Math.max(
      -5000000,
      Math.min(5000000, rawOilDelta + oilGravity),
    );
    const steelDelta = Math.max(
      -5000000,
      Math.min(5000000, rawSteelDelta + steelGravity),
    );

    const newOilPrice = Math.max(
      this.minPrice,
      Math.min(this.maxPrice, safeOil + oilDelta),
    );
    const newSteelPrice = Math.max(
      this.minPrice,
      Math.min(this.maxPrice, safeSteel + steelDelta),
    );

    return {
      oil: newOilPrice,
      steel: newSteelPrice,
    };
  }
}
