import { StateHistory } from "@/application/state-history";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridHistoryAdapter } from "@/engine/combat/history/grid-history-adapter";

export class StateHistoryGridIntegrator {
  private adapter = new GridHistoryAdapter();

  public captureTurnState(
    history: StateHistory,
    turn: number,
    gridState: GridState,
  ): void {
    this.adapter.captureTurn(history, turn, gridState);
  }

  public restoreTurnState(turn: number, gridState: GridState): void {
    this.adapter.rollbackTurn(turn, gridState);
  }
}
