import { GameState } from "@/domain/game/game-state.schema";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export const GAME_STORAGE_CONFIG = {
  DB_NAME: "GeopoliticsEngineDB",
  STORE_NAME: "saves",
  VERSION: 1,
} as const;

export interface SavedRecord {
  gameId: string;
  data: string | ArrayBuffer;
  timestamp: number;
}

export class GameStorageAdapter {
  private serializer = new StateSerializer();
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not available"));
        return;
      }

      const request = indexedDB.open(
        GAME_STORAGE_CONFIG.DB_NAME,
        GAME_STORAGE_CONFIG.VERSION,
      );

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(GAME_STORAGE_CONFIG.STORE_NAME)) {
          db.createObjectStore(GAME_STORAGE_CONFIG.STORE_NAME, {
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

  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    const db = await this.getDb();
    const serialized = this.serializer.serialize(state);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        GAME_STORAGE_CONFIG.STORE_NAME,
        "readwrite",
      );
      const store = transaction.objectStore(GAME_STORAGE_CONFIG.STORE_NAME);
      const request = store.put({
        gameId,
        data: serialized,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        GAME_STORAGE_CONFIG.STORE_NAME,
        "readonly",
      );
      const store = transaction.objectStore(GAME_STORAGE_CONFIG.STORE_NAME);
      const request = store.get(gameId);

      request.onsuccess = () => {
        const result = request.result as SavedRecord | undefined;
        if (!result || typeof result.data !== "string") {
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

  public async saveBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<void> {
    const db = await this.getDb();
    const rawData = buffer.toUint8ArrayBuffer();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        GAME_STORAGE_CONFIG.STORE_NAME,
        "readwrite",
      );
      const store = transaction.objectStore(GAME_STORAGE_CONFIG.STORE_NAME);
      const request = store.put({
        gameId: `${gameId}_bitstate`,
        data: rawData.buffer,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async loadBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const transaction = db.transaction(
          GAME_STORAGE_CONFIG.STORE_NAME,
          "readonly",
        );
        const store = transaction.objectStore(GAME_STORAGE_CONFIG.STORE_NAME);
        const request = store.get(`${gameId}_bitstate`);

        request.onsuccess = () => {
          const record = request.result as SavedRecord | undefined;
          if (record && record.data instanceof ArrayBuffer) {
            buffer.loadArrayBuffer(record.data);
            resolve(true);
          } else {
            resolve(false);
          }
        };
        request.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  public async getAllSaves(): Promise<SavedRecord[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        GAME_STORAGE_CONFIG.STORE_NAME,
        "readonly",
      );
      const store = transaction.objectStore(GAME_STORAGE_CONFIG.STORE_NAME);
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
        [GAME_STORAGE_CONFIG.STORE_NAME],
        "readwrite",
      );

      transaction.objectStore(GAME_STORAGE_CONFIG.STORE_NAME).delete(gameId);
      transaction
        .objectStore(GAME_STORAGE_CONFIG.STORE_NAME)
        .delete(`${gameId}_bitstate`);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
