import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateGameSaveAdapter } from "@/engine/combat/persistence/grid-state-game-save-adapter";

export class GridStateLoaderFacade {
  private adapter = new GridStateGameSaveAdapter();

  public async saveGame(
    gameId: string,
    state: GameState,
    gridState: GridState,
  ): Promise<void> {
    await this.adapter.saveCompleteGame(gameId, state, gridState);
  }

  public async loadGame(
    gameId: string,
    gridState: GridState,
  ): Promise<GameState | null> {
    return this.adapter.loadCompleteGame(gameId, gridState);
  }
}
