import { GameState } from "@/domain/game/game-state.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export interface DetailedConquestLogData {
  conquered: GridCell[];
  capitulated: GridCell[];
  isVictory: boolean;
}

export class ConquestLogWriter {
  public appendConquestLogs(
    state: GameState,
    _attackerId: string,
    _defenderId: string,
    _data: DetailedConquestLogData,
  ): GameState {
    return state;
  }
}
