import type { GameState } from "@/domain/game/game-state.schema";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";
import { DomainEvent, DeltaPatch } from "@/domain/events/domain-event.schema";

export const INDEXED_DB_CONFIG = {
  DB_NAME: "GeopoliticsEngineDB",
  STORE_NAME: "saves",
  EVENTS_STORE: "events",
  CHECKPOINTS_STORE: "checkpoints",
  VERSION: 2,
} as const;

export interface SavedRecord {
  gameId: string;
  data: string;
  timestamp: number;
}

export interface SavedEventRecord {
  id: string;
  gameId: string;
  sequence: number;
  turn: number;
  type: string;
  data: string;
  timestamp: number;
}

export interface SavedCheckpointRecord {
  id: string;
  gameId: string;
  turn: number;
  sequence: number;
  data: string;
  timestamp: number;
}

export class IndexedDbAdapter {
  private serializer = new StateSerializer();

  private getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        INDEXED_DB_CONFIG.DB_NAME,
        INDEXED_DB_CONFIG.VERSION,
      );

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains(INDEXED_DB_CONFIG.STORE_NAME)) {
            db.createObjectStore(INDEXED_DB_CONFIG.STORE_NAME, {
              keyPath: "gameId",
            });
          }
        }

        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains(INDEXED_DB_CONFIG.EVENTS_STORE)) {
            const eventStore = db.createObjectStore(
              INDEXED_DB_CONFIG.EVENTS_STORE,
              { keyPath: "id" },
            );
            eventStore.createIndex("gameId", "gameId", { unique: false });
            eventStore.createIndex("gameId_seq", ["gameId", "sequence"], {
              unique: true,
            });
          }

          if (
            !db.objectStoreNames.contains(INDEXED_DB_CONFIG.CHECKPOINTS_STORE)
          ) {
            const checkpointStore = db.createObjectStore(
              INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
              { keyPath: "id" },
            );
            checkpointStore.createIndex("gameId", "gameId", { unique: false });
            checkpointStore.createIndex("gameId_turn", ["gameId", "turn"], {
              unique: true,
            });
          }
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

  public async saveEvent(event: DomainEvent): Promise<void> {
    const db = await this.getDb();
    const record: SavedEventRecord = {
      id: event.id,
      gameId: event.metadata.gameId,
      sequence: event.metadata.sequence,
      turn: event.metadata.turn,
      type: event.type,
      data: JSON.stringify(event),
      timestamp: event.metadata.timestamp,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.EVENTS_STORE,
        "readwrite",
      );
      const store = transaction.objectStore(INDEXED_DB_CONFIG.EVENTS_STORE);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getGameEvents(gameId: string): Promise<DomainEvent[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.EVENTS_STORE,
        "readonly",
      );
      const store = transaction.objectStore(INDEXED_DB_CONFIG.EVENTS_STORE);
      const index = store.index("gameId");
      const request = index.getAll(gameId);

      request.onsuccess = () => {
        const records = (request.result || []) as SavedEventRecord[];
        const events: DomainEvent[] = [];

        for (let i = 0; i < records.length; i++) {
          const rec = records[i];
          if (!rec) continue;
          try {
            events.push(JSON.parse(rec.data) as DomainEvent);
          } catch {}
        }

        events.sort((a, b) => a.metadata.sequence - b.metadata.sequence);
        resolve(events);
      };

      request.onerror = () => reject(request.error);
    });
  }

  public async saveCheckpoint(
    gameId: string,
    turn: number,
    sequence: number,
    state: GameState,
  ): Promise<void> {
    const db = await this.getDb();
    const serialized = this.serializer.serialize(state);
    const record: SavedCheckpointRecord = {
      id: `${gameId}-t${turn}`,
      gameId,
      turn,
      sequence,
      data: serialized,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
        "readwrite",
      );
      const store = transaction.objectStore(
        INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
      );
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getLatestCheckpoint(
    gameId: string,
  ): Promise<{ turn: number; sequence: number; state: GameState } | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
        "readonly",
      );
      const store = transaction.objectStore(
        INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
      );
      const index = store.index("gameId");
      const request = index.getAll(gameId);

      request.onsuccess = () => {
        const records = (request.result || []) as SavedCheckpointRecord[];
        if (records.length === 0) {
          resolve(null);
          return;
        }

        records.sort((a, b) => b.turn - a.turn);
        const latest = records[0];
        if (!latest) {
          resolve(null);
          return;
        }

        try {
          const state = this.serializer.deserialize(latest.data);
          resolve({
            turn: latest.turn,
            sequence: latest.sequence,
            state,
          });
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
        [
          INDEXED_DB_CONFIG.STORE_NAME,
          INDEXED_DB_CONFIG.EVENTS_STORE,
          INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
        ],
        "readwrite",
      );

      transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME).delete(gameId);

      const eventStore = transaction.objectStore(
        INDEXED_DB_CONFIG.EVENTS_STORE,
      );
      const eventIndex = eventStore.index("gameId");
      const eventReq = eventIndex.getAllKeys(gameId);
      eventReq.onsuccess = () => {
        const keys = eventReq.result;
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k) eventStore.delete(k);
        }
      };

      const checkpointStore = transaction.objectStore(
        INDEXED_DB_CONFIG.CHECKPOINTS_STORE,
      );
      const checkpointIndex = checkpointStore.index("gameId");
      const checkpointReq = checkpointIndex.getAllKeys(gameId);
      checkpointReq.onsuccess = () => {
        const keys = checkpointReq.result;
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (k) checkpointStore.delete(k);
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
