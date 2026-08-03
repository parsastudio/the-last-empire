import { GameState } from "@/domain/game/game-state.schema";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { EventStoreService } from "@/infrastructure/storage/event-store.service";

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
  private indexedDb = new IndexedDbAdapter();
  private localStorage = new LocalStorageAdapter();
  private eventStore = new EventStoreService();

  public async saveGameState(
    gameId: string,
    state: GameState,
    lastActionPayload?: Record<string, unknown>,
    prevState?: GameState | null,
  ): Promise<void> {
    try {
      await this.indexedDb.saveState(gameId, state);

      if (lastActionPayload && prevState) {
        await this.eventStore.appendEvent(
          gameId,
          lastActionPayload,
          prevState,
          state,
        );
      }
    } catch {
      this.localStorage.saveState(gameId, state);
    }
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    try {
      const reconstructed = await this.eventStore.reconstructState(gameId);
      if (reconstructed) {
        return reconstructed;
      }

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

  public getEventStore(): EventStoreService {
    return this.eventStore;
  }
}
