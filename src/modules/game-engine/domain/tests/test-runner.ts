import { runTradePricingTest } from "@/modules/trade/domain/tests/trade-pricing.test";
import { runGameInitializerTest } from "./game-initializer.test";
import { runDeterminismTest } from "./determinism.test";
import { runSyncEngineTest } from "@/infrastructure/sync/tests/sync-engine.test";
import { runSerializerCircularTest } from "@/infrastructure/storage/tests/serializer.test";

export function runAllLevel5Tests(): Record<string, boolean> {
  return {
    tradePricing: runTradePricingTest(),
    gameInitializer: runGameInitializerTest(),
    determinism: runDeterminismTest(),
    syncEngine: runSyncEngineTest(),
    serializerCircular: runSerializerCircularTest(),
  };
}
