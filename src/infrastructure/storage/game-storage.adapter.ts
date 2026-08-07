import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  db,
  SavedGameStateRecord,
} from "@/infrastructure/storage/game-database";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

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
    const rawArrayBuf = uint8ArrayData.buffer.slice(
      uint8ArrayData.byteOffset,
      uint8ArrayData.byteOffset + uint8ArrayData.byteLength,
    ) as ArrayBuffer;

    await db.bitBuffers.put({
      gameId: `${gameId}_bitstate`,
      buffer: rawArrayBuf,
      timestamp: Date.now(),
    });
  }

  public async loadBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    console.group("💾 [RUNTIME TEST 2] GameStorageAdapter.loadBitBuffer");
    const key = `${gameId}_bitstate`;
    console.info("Reading IndexedDB record for key:", key);

    const record = await db.bitBuffers.get(key);

    if (!record) {
      console.warn("⚠️ No record found in IndexedDB for key:", key);
      console.groupEnd();
      return false;
    }

    let rawBuffer: ArrayBuffer | null = null;
    if (
      record.buffer instanceof ArrayBuffer ||
      record.buffer instanceof SharedArrayBuffer
    ) {
      rawBuffer = record.buffer as ArrayBuffer;
    } else if (ArrayBuffer.isView(record.buffer)) {
      const view = record.buffer as ArrayBufferView;
      rawBuffer = view.buffer.slice(
        view.byteOffset,
        view.byteOffset + view.byteLength,
      ) as ArrayBuffer;
    }

    if (!rawBuffer || rawBuffer.byteLength === 0) {
      console.error("❌ Invalid or 0-byte record found in IndexedDB.");
      console.groupEnd();
      return false;
    }

    buffer.loadArrayBuffer(rawBuffer);

    const raw = buffer.getRawBuffer();
    let nonZeroCount = 0;
    for (let i = 0; i < raw.length; i += 16) {
      if ((raw[i]! & 0x00ff) > 0) nonZeroCount++;
    }

    console.info("IndexedDB record non-zero pixel count:", nonZeroCount);

    if (nonZeroCount === 0) {
      console.warn(
        "⚠️ IndexedDB record contains 0 nation pixels! Discarding stale zero cache...",
      );
      await db.bitBuffers.delete(key);
      console.groupEnd();
      return false;
    }

    console.info("✅ Valid non-zero bitbuffer loaded from IndexedDB!");
    console.groupEnd();

    BitPackedGridState.getInstance().markDirty();
    return true;
  }

  public async ensureBitBufferLoaded(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    console.group("🔄 [RUNTIME TEST 3] ensureBitBufferLoaded");
    const loadedFromDb = await this.loadBitBuffer(gameId, buffer);
    if (loadedFromDb) {
      console.info("Loaded successfully from IndexedDB!");
      console.groupEnd();
      return true;
    }

    console.warn("Attempting fallback fetch to live-state.bin from server...");
    const defaultBuffer =
      await ClientFinalStateLoader.loadLiveStateBuffer("map1");
    if (defaultBuffer) {
      buffer.getRawBuffer().set(defaultBuffer.getRawBuffer());
      BitPackedGridState.getInstance().markDirty();
      await this.saveBitBuffer(gameId, buffer);
      console.info(
        "✅ Fallback live-state.bin successfully copied to gridState and saved to IndexedDB!",
      );
      console.groupEnd();
      return true;
    }

    console.error(
      "❌ CRITICAL: Map buffer could not be loaded from IndexedDB nor live-state.bin!",
    );
    console.groupEnd();
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
