import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class LocalStorageAdapter {
  private keyPrefix = "geopolitics_game_";

  public saveState(gameId: string, state: GameState): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const serialized = JSON.stringify(state);
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
      return JSON.parse(stored) as GameState;
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
  private storageAdapter = new GameStorageAdapter();
  private localStorage = new LocalStorageAdapter();

  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    try {
      await this.storageAdapter.saveGameState(gameId, state);
    } catch {
      this.localStorage.saveState(gameId, state);
    }
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    try {
      const stateFromDb = await this.storageAdapter.loadGameState(gameId);
      if (stateFromDb) {
        return stateFromDb;
      }
    } catch {}

    return this.localStorage.loadState(gameId);
  }

  public async removeGameState(gameId: string): Promise<void> {
    try {
      await this.storageAdapter.deleteState(gameId);
    } catch {}
    this.localStorage.removeState(gameId);
  }
}
