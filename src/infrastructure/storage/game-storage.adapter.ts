import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  db,
  SavedGameStateRecord,
} from "@/infrastructure/storage/game-database";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class GameStorageAdapter {
  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    await db.gameStates.put({
      gameId,
      state,
      timestamp: Date.now(),
    });
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    const record = await db.gameStates.get(gameId);
    return record?.state ?? null;
  }

  public async saveBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<void> {
    const uint8ArrayData = buffer.toUint8ArrayBuffer();
    await db.bitBuffers.put({
      gameId: `${gameId}_bitstate`,
      buffer: uint8ArrayData.buffer.slice(
        uint8ArrayData.byteOffset,
        uint8ArrayData.byteOffset + uint8ArrayData.byteLength,
      ) as ArrayBuffer,
      timestamp: Date.now(),
    });
  }

  public async loadBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    const record = await db.bitBuffers.get(`${gameId}_bitstate`);
    if (
      record &&
      (record.buffer instanceof ArrayBuffer ||
        record.buffer instanceof SharedArrayBuffer)
    ) {
      buffer.loadArrayBuffer(record.buffer as ArrayBuffer);
      BitPackedGridState.getInstance().markDirty();
      return true;
    }
    return false;
  }

  public async getAllSaves(): Promise<SavedGameStateRecord[]> {
    return await db.gameStates.orderBy("timestamp").reverse().toArray();
  }

  public async deleteState(gameId: string): Promise<void> {
    await db.transaction("rw", db.gameStates, db.bitBuffers, async () => {
      await db.gameStates.delete(gameId);
      await db.bitBuffers.delete(`${gameId}_bitstate`);
    });
  }
}
