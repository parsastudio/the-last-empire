import { MarketEngine } from "@/engine/economy/market-engine";
import type { Nation } from "@/domain/nation/nation.schema";
import type { ResourceMarketPrice } from "@/domain/economy/economy.schema";

export function runTradePricingTest(): boolean {
  const engine = new MarketEngine();
  const initialPrices: ResourceMarketPrice = {
    oil: 100,
    steel: 100,
  };
  const nationTemplate = {
    id: "NATION_TEST",
    name: "Test Land",
    treasury: 1000000,
    resources: {
      oil: 0,
      steel: 0,
      manpower: 500,
    },
  } as unknown as Nation;

  const resBuy = engine.buyResource(
    { ...nationTemplate },
    { ...initialPrices },
    "oil",
    10,
  );

  const expectedCost = 10 * 100 + (10 * 9) / 2;
  const expectedCostWithFee = Math.floor(expectedCost * 1.1);
  const buySucceeded =
    resBuy.updatedNation.treasury === 1000000 - expectedCostWithFee &&
    resBuy.updatedNation.resources.oil === 10 &&
    resBuy.updatedMarketPrices.oil === 110;

  const resSell = engine.sellResource(
    resBuy.updatedNation,
    resBuy.updatedMarketPrices,
    "oil",
    10,
  );

  const expectedRevenue = 10 * 110 - (10 * 9) / 2;
  const expectedRevenueWithFee = Math.floor(expectedRevenue * 0.9);
  const sellSucceeded =
    resSell.updatedNation.treasury ===
      resBuy.updatedNation.treasury + expectedRevenueWithFee &&
    resSell.updatedNation.resources.oil === 0 &&
    resSell.updatedMarketPrices.oil === 100;

  return buySucceeded && sellSucceeded;
}
