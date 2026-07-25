import { runGridConquestTest } from "@/engine/combat/tests/grid-conquest.test";
import { runCompleteWarScenarioTest } from "@/engine/combat/tests/complete-war.test";
import { runTurnPipelineIntegrationTest } from "@/engine/combat/tests/turn-pipeline-integration.test";
import { runIntegrationConquestFlowTest } from "@/engine/combat/tests/integration-conquest.test.ts";
import { runDynamicEnclaveSplittingTest } from "@/engine/combat/tests/dynamic-enclave-splitting.test";
import { runCanalNavigationFlowTest } from "@/engine/combat/tests/canal-navigation-flow.test";
import { runConquestEngineIntegrationTest } from "@/engine/combat/tests/conquest-engine-integration.test";

export class SystemTestSuiteRunner {
  public runAllSystemTests(): Record<string, boolean> {
    return {
      gridConquest: runGridConquestTest(),
      completeWarScenario: runCompleteWarScenarioTest(),
      turnPipelineIntegration: runTurnPipelineIntegrationTest(),
      integrationConquestFlow: runIntegrationConquestFlowTest(),
      dynamicEnclaveSplitting: runDynamicEnclaveSplittingTest(),
      canalNavigationFlow: runCanalNavigationFlowTest(),
      conquestEngineIntegration: runConquestEngineIntegrationTest(),
    };
  }
}
