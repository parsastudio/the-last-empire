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

  public async ensureBitBufferLoaded(
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    if (buffer.getRawBuffer()[0]! > 0) {
      return true;
    }

    const defaultBuffer =
      await ClientFinalStateLoader.loadLiveStateBuffer("map1");
    if (defaultBuffer) {
      buffer.getRawBuffer().set(defaultBuffer.getRawBuffer());
      BitPackedGridState.getInstance().markDirty();
      return true;
    }

    return false;
  }

  public async getAllSaves(): Promise<SavedGameStateRecord[]> {
    return await db.gameStates.orderBy("timestamp").reverse().toArray();
  }

  public async deleteState(gameId: string): Promise<void> {
    await db.gameStates.delete(gameId);
  }
}
