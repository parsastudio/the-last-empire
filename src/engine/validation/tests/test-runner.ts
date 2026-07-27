import { runTradePricingTest } from "@/engine/economy/tests/trade-pricing.test";
import { runDeterminismTest } from "@/engine/validation/tests/determinism.test";
import { runSyncEngineTest } from "@/infrastructure/sync/tests/sync-engine.test";
import { runSerializerCircularTest } from "@/infrastructure/storage/tests/serializer.test";

export function runAllLevel5Tests(): Record<string, boolean> {
  return {
    tradePricing: runTradePricingTest(),
    determinism: runDeterminismTest(),
    syncEngine: runSyncEngineTest(),
    serializerCircular: runSerializerCircularTest(),
  };
}
