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
  const bulkResult = engine.buyResource(
    { ...nationTemplate },
    { ...initialPrices },
    "oil",
    100,
  );
  let stepPrices = { ...initialPrices };
  let stepNation = { ...nationTemplate };
  for (let i = 0; i < 100; i++) {
    const res = engine.buyResource(stepNation, stepPrices, "oil", 1);
    stepPrices = res.updatedMarketPrices;
    stepNation = res.updatedNation;
  }
  const treasuryMatches =
    stepNation.treasury === bulkResult.updatedNation.treasury;
  const oilMatches =
    stepNation.resources.oil === bulkResult.updatedNation.resources.oil;
  const priceMatches = stepPrices.oil === bulkResult.updatedMarketPrices.oil;
  return treasuryMatches && oilMatches && priceMatches;
}
