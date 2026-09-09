import { GameState, TurnLogEntry } from "@geopolitics/domain";

export interface ExecutionResult<TData = unknown> {
  newState: GameState;
  resultData?: TData;
  logs?: TurnLogEntry[];
}
