import { runGridConquestTest } from "@/engine/combat/tests/grid-conquest.test";
import { runCompleteWarScenarioTest } from "@/engine/combat/tests/complete-war.test";
import { runTurnPipelineIntegrationTest } from "@/engine/combat/tests/turn-pipeline-integration.test";
import { runIntegrationConquestFlowTest } from "@/engine/combat/tests/integration-conquest.test";

export class CombatTestSuite {
  public runAllTests(): Record<string, boolean> {
    return {
      gridConquest: runGridConquestTest(),
      completeWarScenario: runCompleteWarScenarioTest(),
      turnPipelineIntegration: runTurnPipelineIntegrationTest(),
      integrationConquestFlow: runIntegrationConquestFlowTest(),
    };
  }
}
