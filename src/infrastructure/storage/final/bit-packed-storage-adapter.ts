import { INDEXED_DB_CONFIG } from "@/infrastructure/storage/indexed-db-adapter";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export class BitPackedStorageAdapter {
  private getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        INDEXED_DB_CONFIG.DB_NAME,
        INDEXED_DB_CONFIG.VERSION,
      );
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<void> {
    if (typeof window === "undefined") return;
    const db = await this.getDb();
    const rawData = buffer.toUint8ArrayBuffer();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        INDEXED_DB_CONFIG.STORE_NAME,
        "readwrite",
      );
      const store = transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME);
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
    if (typeof window === "undefined") return false;
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const transaction = db.transaction(
          INDEXED_DB_CONFIG.STORE_NAME,
          "readonly",
        );
        const store = transaction.objectStore(INDEXED_DB_CONFIG.STORE_NAME);
        const request = store.get(`${gameId}_bitstate`);

        request.onsuccess = () => {
          const record = request.result as { data: ArrayBuffer } | undefined;
          if (record && record.data) {
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
}
