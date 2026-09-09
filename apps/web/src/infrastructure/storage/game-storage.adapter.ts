import { GameState, BitPackedBuffer } from "@geopolitics/domain";
import {
  db,
  SavedGameStateRecord,
} from "@/infrastructure/storage/game-database";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";
import { TurnLogRepository } from "@/infrastructure/storage/repositories/turn-log.repository";

export class GameStorageAdapter {
  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    const now = Date.now();
    const cleanState: GameState = {
      ...state,
      turnLogs: state.turnLogs.slice(-10),
    };

    await db.transaction("rw", db.gameStates, db.turnLogs, async () => {
      await db.gameStates.put({
        gameId,
        state: cleanState,
        timestamp: now,
      });

      if (state.turnLogs.length > 0) {
        await TurnLogRepository.appendLogs(gameId, state.turnLogs);
      }
    });
  }

  public async loadGameState(gameId: string): Promise<GameState | null> {
    const record = await db.gameStates.get(gameId);
    return record?.state ?? null;
  }

  public async ensureBitBufferLoaded(
    buffer: BitPackedBuffer,
    mapId = "map1",
  ): Promise<boolean> {
    const gridState = BitPackedGridState.getInstance();
    if (gridState.isBufferLoaded()) {
      return true;
    }

    const defaultBuffer =
      await ClientFinalStateLoader.loadLiveStateBuffer(mapId);
    if (defaultBuffer) {
      buffer.getRawBuffer().set(defaultBuffer.getRawBuffer());
      gridState.markLoaded();
      return true;
    }

    return false;
  }

  public async getAllSaves(): Promise<SavedGameStateRecord[]> {
    return await db.gameStates.orderBy("timestamp").reverse().toArray();
  }

  public async deleteState(gameId: string): Promise<void> {
    await db.transaction("rw", db.gameStates, db.turnLogs, async () => {
      await db.gameStates.delete(gameId);
      await TurnLogRepository.clearLogsForGame(gameId);
    });
  }
}
