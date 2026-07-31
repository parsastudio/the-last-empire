import { ResourceMarketPrice } from "@/domain/economy/economy.schema";

export class MarketPricingCalculator {
  private readonly fixedBasePrice = 25000000;

  public updateMarketPrices(): ResourceMarketPrice {
    return {
      oil: this.fixedBasePrice,
      steel: this.fixedBasePrice,
    };
  }
}
