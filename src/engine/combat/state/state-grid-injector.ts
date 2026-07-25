import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";

export class StateGridInjector {
  public injectGridState(state: GameState, gridState: GridState): GameState {
    return {
      ...state,
      gridState,
    } as GameState;
  }

  public extractGridState(state: GameState): GridState | undefined {
    return (state as { gridState?: GridState }).gridState;
  }
}
