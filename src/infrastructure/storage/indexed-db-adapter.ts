import { GameState } from "@/domain/game/game-state.schema";
import {
  GameStorageAdapter,
  SavedRecord,
  GAME_STORAGE_CONFIG,
} from "@/infrastructure/storage/game-storage.adapter";

export { GAME_STORAGE_CONFIG as INDEXED_DB_CONFIG };
export type { SavedRecord };

export class IndexedDbAdapter {
  private adapter = new GameStorageAdapter();

  public async saveState(gameId: string, state: GameState): Promise<void> {
    await this.adapter.saveGameState(gameId, state);
  }

  public async loadState(gameId: string): Promise<GameState | null> {
    return this.adapter.loadGameState(gameId);
  }

  public async getAllSaves(): Promise<SavedRecord[]> {
    return this.adapter.getAllSaves();
  }

  public async deleteState(gameId: string): Promise<void> {
    await this.adapter.deleteState(gameId);
  }
}
