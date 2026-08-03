import { GameState } from "@/domain/game/game-state.schema";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";

export class LocalStorageAdapter {
  private serializer = new StateSerializer();
  private keyPrefix = "geopolitics_game_";

  public saveState(gameId: string, state: GameState): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const serialized = this.serializer.serialize(state);
      localStorage.setItem(`${this.keyPrefix}${gameId}`, serialized);
    } catch {}
  }

  public loadState(gameId: string): GameState | null {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = localStorage.getItem(`${this.keyPrefix}${gameId}`);
    if (!stored) {
      return null;
    }
    try {
      return this.serializer.deserialize(stored);
    } catch {
      return null;
    }
  }

  public removeState(gameId: string): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.removeItem(`${this.keyPrefix}${gameId}`);
    } catch {}
  }
}

export class ClientStorageService {
  private indexedDb = new IndexedDbAdapter();
  private localStorage = new LocalStorageAdapter();

  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    try {
      await this.indexedDb.saveState(gameId, state);
    } catch {
      this.localStorage.saveState(gameId, state);
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

  public async removeGameState(gameId: string): Promise<void> {
    try {
      await this.indexedDb.deleteState(gameId);
    } catch {}
    this.localStorage.removeState(gameId);
  }
}
