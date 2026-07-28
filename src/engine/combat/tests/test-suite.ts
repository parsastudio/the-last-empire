import { runGridConquestTest } from "@/engine/combat/tests/grid-conquest.test";
import { runCompleteWarScenarioTest } from "@/engine/combat/tests/complete-war.test";
import { runTurnPipelineIntegrationTest } from "@/engine/combat/tests/turn-pipeline-integration.test";
import { runIntegrationConquestFlowTest } from "@/engine/combat/tests/integration-conquest.test";
import { runRegionClusteringTest } from "@/engine/combat/tests/region-clustering.test";
import { runIsolatedConquestTest } from "@/engine/combat/tests/isolated-conquest.test";
import { runCasualtyRetreatTest } from "@/engine/combat/tests/casualty-retreat.test";
import { runMilitiaGarrisonTest } from "@/engine/combat/tests/militia-garrison.test";

export class CombatTestSuite {
  public runAllTests(): Record<string, boolean> {
    return {
      gridConquest: runGridConquestTest(),
      completeWarScenario: runCompleteWarScenarioTest(),
      turnPipelineIntegration: runTurnPipelineIntegrationTest(),
      integrationConquestFlow: runIntegrationConquestFlowTest(),
      regionClustering: runRegionClusteringTest(),
      isolatedConquest: runIsolatedConquestTest(),
      casualtyRetreat: runCasualtyRetreatTest(),
      militiaGarrison: runMilitiaGarrisonTest(),
    };
  }
}
