import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateGameSaveAdapter } from "@/engine/combat/persistence/grid-state-game-save-adapter";

export class GridStateSaveOrchestrator {
  private adapter = new GridStateGameSaveAdapter();

  public async executeSave(
    gameId: string,
    state: GameState,
    gridState: GridState,
  ): Promise<void> {
    await this.adapter.saveCompleteGame(gameId, state, gridState);
  }
}
