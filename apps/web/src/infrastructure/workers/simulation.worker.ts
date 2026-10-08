/// <reference lib="webworker" />

import {
  TurnProgressionOrchestrator,
  ActionEngine,
} from "@geopolitics/game-engine";
import { SeededRandom } from "@geopolitics/domain";
import {
  SimulationWorkerRequest,
  SimulationWorkerResponse,
} from "@/infrastructure/workers/simulation.worker.types";

const orchestrator = new TurnProgressionOrchestrator();

self.addEventListener("message", (event: MessageEvent<SimulationWorkerRequest>) => {
  const request = event.data;
  if (!request || !request.id) return;

  try {
    if (request.type === "ADVANCE_TURN") {
      const prng = new SeededRandom(
        request.seed ??
          request.state.seed ??
          Math.floor(Math.random() * 1000000),
      );

      const { newState, newTurnLogs } = orchestrator.advanceTurnWithLogs(
        request.state,
        prng,
      );

      const response: SimulationWorkerResponse = {
        id: request.id,
        success: true,
        type: "ADVANCE_TURN",
        newState,
        newTurnLogs,
      };

      self.postMessage(response);
      return;
    }

    if (request.type === "EXECUTE_ACTION") {
      const result = ActionEngine.execute(request.state, request.action);

      if (result.success && result.newState) {
        const response: SimulationWorkerResponse = {
          id: request.id,
          success: true,
          type: "EXECUTE_ACTION",
          newState: result.newState,
          message: result.message,
          resultData: result.resultData,
          logs: result.logs,
        };
        self.postMessage(response);
      } else {
        const response: SimulationWorkerResponse = {
          id: request.id,
          success: false,
          error: result.message || "ACTION_EXECUTION_FAILED",
        };
        self.postMessage(response);
      }
      return;
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "SIMULATION_WORKER_INTERNAL_ERROR";
    const response: SimulationWorkerResponse = {
      id: request.id,
      success: false,
      error: errorMsg,
    };
    self.postMessage(response);
  }
});
