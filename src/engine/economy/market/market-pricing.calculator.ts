import { ResourceMarketPrice } from "@/domain/economy/economy.schema";

export class MarketPricingCalculator {
  private readonly minPrice = 10;
  private readonly maxPrice = 500;

  public updateMarketPrices(
    currentPrices: ResourceMarketPrice,
    totalOilDemand: number,
    totalOilSupply: number,
    totalSteelDemand: number,
    totalSteelSupply: number,
  ): ResourceMarketPrice {
    const baseOilPrice = 100;
    const baseSteelPrice = 100;
    const passiveOilSupply = 150;
    const passiveSteelSupply = 100;

    const oilBalance = totalOilDemand - (totalOilSupply + passiveOilSupply);
    const steelBalance =
      totalSteelDemand - (totalSteelSupply + passiveSteelSupply);

    const rawOilDelta = Math.floor(oilBalance * 0.05);
    const rawSteelDelta = Math.floor(steelBalance * 0.05);

    const oilGravity = Math.floor((baseOilPrice - currentPrices.oil) * 0.05);
    const steelGravity = Math.floor(
      (baseSteelPrice - currentPrices.steel) * 0.05,
    );

    const oilDelta = Math.max(-20, Math.min(20, rawOilDelta + oilGravity));
    const steelDelta = Math.max(
      -20,
      Math.min(20, rawSteelDelta + steelGravity),
    );

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
}
