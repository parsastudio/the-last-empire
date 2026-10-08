import { GameAction, GameState, TurnLogEntry } from "@geopolitics/domain";

export type SimulationWorkerRequest =
  | {
      id: string;
      type: "ADVANCE_TURN";
      state: GameState;
      seed?: number;
    }
  | {
      id: string;
      type: "EXECUTE_ACTION";
      state: GameState;
      action: GameAction;
    };

export type SimulationWorkerResponse =
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
