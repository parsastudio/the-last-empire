import { MarketEngine } from "../market-engine";
import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { ResourceMarketPrice } from "@/modules/economy/schemas/economy.schema";

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
    },
  } as unknown as Nation;

  let singleTxNation = { ...nationTemplate };
  let singleTxPrices = { ...initialPrices };

  for (let i = 0; i < 100; i++) {
    const result = engine.buyResource(singleTxNation, singleTxPrices, "oil", 1);
    singleTxNation = result.updatedNation;
    singleTxPrices = result.updatedMarketPrices;
  }

  const bulkResult = engine.buyResource(
    { ...nationTemplate },
    { ...initialPrices },
    "oil",
    100,
  );

  const treasuryMatches =
    singleTxNation.treasury === bulkResult.updatedNation.treasury;
  const oilMatches =
    singleTxNation.resources.oil === bulkResult.updatedNation.resources.oil;
  const priceMatches =
    singleTxPrices.oil === bulkResult.updatedMarketPrices.oil;

  return treasuryMatches && oilMatches && priceMatches;
}
