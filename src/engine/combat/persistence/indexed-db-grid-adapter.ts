import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateSerializer } from "@/engine/combat/persistence/grid-state-serializer";
import { GridStateDeserializer } from "@/engine/combat/persistence/grid-state-deserializer";

export class IndexedDbGridAdapter {
  private serializer = new GridStateSerializer();
  private deserializer = new GridStateDeserializer();
  private dbName = "GeopoliticsEngineDB";
  private storeName = "grid_saves";
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

  public async saveGridState(
    gameId: string,
    gridState: GridState,
  ): Promise<void> {
    const db = await this.getDb();
    const serialized = this.serializer.serialize(gridState.getAllCells());

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

  public async loadGridState(
    gameId: string,
    gridState: GridState,
  ): Promise<boolean> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(gameId);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(false);
          return;
        }
        gridState.clear();
        const cells = this.deserializer.deserialize(result.data);
        for (const cell of cells) {
          gridState.setCell(cell.x, cell.y, cell);
        }
        resolve(true);
      };

      request.onerror = () => reject(request.error);
    });
  }
}
