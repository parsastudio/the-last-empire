import { GameState } from "@/domain/game/game-state.schema";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { IndexedDbGridAdapter } from "@/engine/combat/persistence/indexed-db-grid-adapter";
import { GridState } from "@/engine/combat/state/grid-state";

export class GridStateGameSaveAdapter {
  private gameDbAdapter = new IndexedDbAdapter();
  private gridDbAdapter = new IndexedDbGridAdapter();

  public async saveCompleteGame(
    gameId: string,
    state: GameState,
    gridState: GridState,
  ): Promise<void> {
    await this.gameDbAdapter.saveState(gameId, state);
    await this.gridDbAdapter.saveGridState(gameId, gridState);
  }

  public async loadCompleteGame(
    gameId: string,
    gridState: GridState,
  ): Promise<GameState | null> {
    const state = await this.gameDbAdapter.loadState(gameId);
    if (!state) {
      return null;
    }

    const success = await this.gridDbAdapter.loadGridState(gameId, gridState);
    if (!success) {
      return null;
    }

    return state;
  }
}
