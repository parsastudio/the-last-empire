import type { GameState } from "@/domain/game/game-state.schema";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";

export const INDEXED_DB_CONFIG = {
  DB_NAME: "GeopoliticsEngineDB",
  STORE_NAME: "saves",
  VERSION: 1,
} as const;

export interface SavedRecord {
  gameId: string;
  data: string;
  timestamp: number;
}

export class IndexedDbAdapter {
  private serializer = new StateSerializer();
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(
        INDEXED_DB_CONFIG.DB_NAME,
        INDEXED_DB_CONFIG.VERSION,
      );

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(INDEXED_DB_CONFIG.STORE_NAME)) {
          db.createObjectStore(INDEXED_DB_CONFIG.STORE_NAME, {
            keyPath: "gameId",
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });
    return this.dbPromise;
  }

  public async saveState(gameId: string, state: GameState): Promise<void> {
    const db = await this.getDb();
    const serialized = this.serializer.serialize(state);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.STORE_NAME,
        "readwrite",
      );
      const store = transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME);
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
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.STORE_NAME,
        "readonly",
      );
      const store = transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME);
      const request = store.get(gameId);

      request.onsuccess = () => {
        const result = request.result as SavedRecord | undefined;
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

  public async getAllSaves(): Promise<SavedRecord[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.STORE_NAME,
        "readonly",
      );
      const store = transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () =>
        resolve((request.result || []) as SavedRecord[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteState(gameId: string): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [INDEXED_DB_CONFIG.STORE_NAME],
        "readwrite",
      );

      transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME).delete(gameId);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
