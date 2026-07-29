import { GameState } from "@/domain/game/game-state.schema";
import { IndexedDbAdapter, SavedRecord } from "./indexed-db-adapter";
import { LocalStorageAdapter } from "./local-storage-adapter";

export class ClientStorageService {
  private indexedDb = new IndexedDbAdapter();
  private localStorage = new LocalStorageAdapter();

  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    try {
      await this.indexedDb.saveState(gameId, state);
      await this.indexedDb.saveState("active_game", state);
    } catch {
      this.localStorage.saveState(gameId, state);
      this.localStorage.saveState("active_game", state);
    }
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    try {
      const stateFromDb = await this.indexedDb.loadState(gameId);
      if (stateFromDb) {
        return stateFromDb;
      }
    } catch {}

    return this.localStorage.loadState(gameId);
  }

  public async getAllSavedCampaigns(): Promise<SavedRecord[]> {
    try {
      return await this.indexedDb.getAllSaves();
    } catch {
      return [];
    }
  }

  public async removeGameState(gameId: string): Promise<void> {
    try {
      await this.indexedDb.deleteState(gameId);
    } catch {}
    this.localStorage.removeState(gameId);
  }
}
