import {
  db,
  SavedBinaryAssetRecord,
} from "@/infrastructure/storage/game-database";

export class BinaryAssetRepository {
  public static async getAsset(key: string): Promise<ArrayBuffer | null> {
    try {
      const record = await db.binaryAssets.get(key);
      if (!record || !record.data || record.data.byteLength === 0) {
        return null;
      }
      return record.data;
    } catch {
      return null;
    }
  }

  public static async saveAsset(key: string, data: ArrayBuffer): Promise<void> {
    try {
      const record: SavedBinaryAssetRecord = {
        key,
        data,
        timestamp: Date.now(),
      };
      await db.binaryAssets.put(record);
    } catch {}
  }

  public static async hasAsset(key: string): Promise<boolean> {
    try {
      const count = await db.binaryAssets.where("key").equals(key).count();
      return count > 0;
    } catch {
      return false;
    }
  }

  public static async clearAssets(): Promise<void> {
    try {
      await db.binaryAssets.clear();
    } catch {}
  }
}
