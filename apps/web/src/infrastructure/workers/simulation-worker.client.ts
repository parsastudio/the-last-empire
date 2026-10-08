import {
  GameState,
  GameAction,
  TurnLogEntry,
  SeededRandom,
  MapTopologyRegistry,
  CountryRegistry,
} from "@geopolitics/domain";
import {
  TurnProgressionOrchestrator,
  ActionEngine,
} from "@geopolitics/game-engine";
import {
  SimulationWorkerRequest,
  SimulationWorkerResponse,
} from "@/infrastructure/workers/simulation.worker.types";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

export class SimulationWorkerClient {
  private static instance: SimulationWorkerClient | null = null;
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCounter = 0;
  private fallbackOrchestrator: TurnProgressionOrchestrator | null = null;

  private constructor() {
    this.initWorker();
  }

  public static getInstance(): SimulationWorkerClient {
    if (!this.instance) {
      this.instance = new SimulationWorkerClient();
    }
    return this.instance;
  }

  private initWorker(): void {
    if (typeof window === "undefined" || !("Worker" in window)) {
      return;
    }

    try {
      this.worker = new Worker(
        new URL("./simulation.worker.ts", import.meta.url),
        { type: "module" },
      );

      this.worker.addEventListener(
        "message",
        (event: MessageEvent<SimulationWorkerResponse>) => {
          const response = event.data;
          if (!response || !response.id) return;

          const pending = this.pendingRequests.get(response.id);
          if (!pending) return;

          this.pendingRequests.delete(response.id);

          if (response.success) {
            pending.resolve(response);
          } else {
            pending.reject(new Error(response.error));
          }
        },
      );

      this.worker.addEventListener("error", (errorEvent) => {
        console.error("SimulationWorker runtime error:", errorEvent);
      });

      void ClientFinalStateLoader.ensureManifestLoaded("map1").then(
        (manifest) => {
          if (manifest && this.worker) {
            void this.sendRequest({
              type: "INIT",
              manifest,
            }).catch(() => {});
          }
        },
      );
    } catch (err) {
      console.warn(
        "SimulationWorker could not be initialized, falling back to main-thread processing:",
        err,
      );
      this.worker = null;
    }
  }

  private sendRequest<TResponse>(
    requestData: Omit<SimulationWorkerRequest, "id">,
  ): Promise<TResponse> {
    const id = `req_${Date.now()}_${++this.requestCounter}`;
    const payload: SimulationWorkerRequest = {
      ...requestData,
      id,
    } as SimulationWorkerRequest;

    if (!this.worker) {
      return this.executeFallback<TResponse>(payload);
    }

    return new Promise<TResponse>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (val: unknown) => void,
        reject,
      });
      this.worker!.postMessage(payload);
    });
  }

  private executeFallback<TResponse>(
    request: SimulationWorkerRequest,
  ): Promise<TResponse> {
    try {
      if (request.manifest) {
        MapTopologyRegistry.initializeFromManifest(request.manifest);
        CountryRegistry.initializeFromManifest(request.manifest);
      }

      if (request.type === "INIT") {
        return Promise.resolve({
          id: request.id,
          success: true,
          type: "INIT",
        } as unknown as TResponse);
      }

      if (request.type === "ADVANCE_TURN") {
        if (!this.fallbackOrchestrator) {
          this.fallbackOrchestrator = new TurnProgressionOrchestrator();
        }
        const prng = new SeededRandom(
          request.seed ??
            request.state.seed ??
            Math.floor(Math.random() * 1000000),
        );
        const { newState, newTurnLogs } =
          this.fallbackOrchestrator.advanceTurnWithLogs(request.state, prng);

        return Promise.resolve({
          id: request.id,
          success: true,
          type: "ADVANCE_TURN",
          newState,
          newTurnLogs,
        } as unknown as TResponse);
      }

      if (request.type === "EXECUTE_ACTION") {
        const result = ActionEngine.execute(request.state, request.action);
        if (result.success && result.newState) {
          return Promise.resolve({
            id: request.id,
            success: true,
            type: "EXECUTE_ACTION",
            newState: result.newState,
            message: result.message,
            resultData: result.resultData,
            logs: result.logs,
          } as unknown as TResponse);
        }
        return Promise.reject(
          new Error(result.message || "ACTION_EXECUTION_FAILED"),
        );
      }

      return Promise.reject(new Error("UNKNOWN_REQUEST_TYPE"));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async advanceTurn(
    state: GameState,
    seed?: number,
  ): Promise<{ newState: GameState; newTurnLogs: TurnLogEntry[] }> {
    const manifest = await ClientFinalStateLoader.ensureManifestLoaded("map1");

    const response = await this.sendRequest<{
      id: string;
      success: true;
      type: "ADVANCE_TURN";
      newState: GameState;
      newTurnLogs: TurnLogEntry[];
    }>({
      type: "ADVANCE_TURN",
      state,
      seed,
      manifest,
    });

    return {
      newState: response.newState,
      newTurnLogs: response.newTurnLogs,
    };
  }

  public async executeAction(
    state: GameState,
    action: GameAction,
  ): Promise<{
    newState: GameState;
    message: string;
    resultData?: unknown;
    logs?: TurnLogEntry[];
  }> {
    const manifest = await ClientFinalStateLoader.ensureManifestLoaded("map1");

    const response = await this.sendRequest<{
      id: string;
      success: true;
      type: "EXECUTE_ACTION";
      newState: GameState;
      message: string;
      resultData?: unknown;
      logs?: TurnLogEntry[];
    }>({
      type: "EXECUTE_ACTION",
      state,
      action,
      manifest,
    });

    return {
      newState: response.newState,
      message: response.message,
      resultData: response.resultData,
      logs: response.logs,
    };
  }
}
