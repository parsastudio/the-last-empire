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

    console.group("💾 [DIAGNOSTIC] GameStorageAdapter.saveBitBuffer");
    console.info(
      "Saving bit state to IndexedDB for key:",
      `${gameId}_bitstate`,
    );
    console.info("Saving byte length:", rawArrayBuf.byteLength);
    console.groupEnd();

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
    console.group("📂 [DIAGNOSTIC] GameStorageAdapter.loadBitBuffer");
    const key = `${gameId}_bitstate`;
    console.info("Reading IndexedDB for key:", key);

    const record = await db.bitBuffers.get(key);

    if (!record) {
      console.warn("⚠️ Record not found in IndexedDB for key:", key);
      console.groupEnd();
      return false;
    }

    console.info(
      "Record retrieved from IndexedDB. Timestamp:",
      new Date(record.timestamp).toISOString(),
    );

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
      console.error("❌ Record buffer in IndexedDB is invalid or 0 bytes.");
      console.groupEnd();
      return false;
    }

    buffer.loadArrayBuffer(rawBuffer);

    const raw = buffer.getRawBuffer();
    let nonZeroCount = 0;
    for (let i = 0; i < raw.length; i += 16) {
      if ((raw[i]! & 0x00ff) > 0) nonZeroCount++;
    }

    console.info(
      "IndexedDB loaded buffer non-zero pixels count sample:",
      nonZeroCount,
    );

    if (nonZeroCount === 0) {
      console.error(
        "❌ IndexedDB record exists but contains ALL ZEROS! Discarding IndexedDB cache...",
      );
      console.groupEnd();
      return false;
    }

    console.info("✅ Valid non-zero map state restored from IndexedDB!");
    console.groupEnd();

    BitPackedGridState.getInstance().markDirty();
    return true;
  }

  public async ensureBitBufferLoaded(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    const loadedFromDb = await this.loadBitBuffer(gameId, buffer);
    if (loadedFromDb) {
      return true;
    }

    console.warn(
      "⚠️ BitBuffer not found in IndexedDB or was empty. Attempting fallback to live-state.bin...",
    );
    const defaultBuffer =
      await ClientFinalStateLoader.loadLiveStateBuffer("map1");
    if (defaultBuffer) {
      buffer.getRawBuffer().set(defaultBuffer.getRawBuffer());
      BitPackedGridState.getInstance().markDirty();
      console.info("✅ Fallback live-state.bin successfully set in gridState!");
      return true;
    }

    console.error(
      "❌ CRITICAL: Failed to load map buffer from both IndexedDB and live-state.bin!",
    );
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
