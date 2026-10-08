import {
  GameAction,
  GameState,
  TurnLogEntry,
  FinalMapManifest,
} from "@geopolitics/domain";

export type SimulationWorkerRequestPayload =
  | {
      type: "INIT";
      manifest: FinalMapManifest;
    }
  | {
      type: "ADVANCE_TURN";
      state: GameState;
      seed?: number;
      manifest?: FinalMapManifest | null;
    }
  | {
      type: "EXECUTE_ACTION";
      state: GameState;
      action: GameAction;
      manifest?: FinalMapManifest | null;
    };

export type SimulationWorkerRequest =
  | {
      id: string;
      type: "INIT";
      manifest: FinalMapManifest;
    }
  | {
      id: string;
      type: "ADVANCE_TURN";
      state: GameState;
      seed?: number;
      manifest?: FinalMapManifest | null;
    }
  | {
      id: string;
      type: "EXECUTE_ACTION";
      state: GameState;
      action: GameAction;
      manifest?: FinalMapManifest | null;
    };

export type SimulationWorkerResponse =
  | {
      id: string;
      success: true;
      type: "INIT";
    }
  | {
      id: string;
      success: true;
      type: "ADVANCE_TURN";
      newState: GameState;
      newTurnLogs: TurnLogEntry[];
    }
  | {
      id: string;
      success: true;
      type: "EXECUTE_ACTION";
      newState?: GameState;
      message: string;
      resultData?: unknown;
      logs?: TurnLogEntry[];
    }
  | {
      id: string;
      success: false;
      error: string;
    };
