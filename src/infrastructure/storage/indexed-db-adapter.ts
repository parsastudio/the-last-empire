import type { GameState } from "@/domain/game/game-state.schema";
import { StateSerializer } from "./state-serializer";

export class IndexedDbAdapter {
  private serializer = new StateSerializer();
  private dbName = "GeopoliticsEngineDB";
  private storeName = "saves";
  private version = 1;

  private getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "gameId" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveState(gameId: string, state: GameState): Promise<void> {
    const db = await this.getDb();
    const serialized = this.serializer.serialize(state);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        gameId,
        data: serialized,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async loadState(gameId: string): Promise<GameState | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(gameId);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        try {
          const state = this.serializer.deserialize(result.data);
          resolve(state);
        } catch {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  public async deleteState(gameId: string): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(gameId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
