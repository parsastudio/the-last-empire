import {
  GameState,
  BitPackedBuffer,
  TurnLogWindowUtility,
} from "@geopolitics/domain";
import {
  db,
  SavedGameStateRecord,
} from "@/infrastructure/storage/game-database";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

export class GameStorageAdapter {
  public async saveGameState(gameId: string, state: GameState): Promise<void> {
    const prunedLogs = TurnLogWindowUtility.pruneLogs(
      state.turnLogs,
      state.currentTurn,
    );
    const normalizedState: GameState = {
      ...state,
      turnLogs: prunedLogs,
    };

    const now = Date.now();
    const minTurn = Math.max(
      1,
      state.currentTurn - (TurnLogWindowUtility.MAX_RETAINED_TURNS - 1),
    );

    await db.transaction("rw", db.gameStates, db.turnLogs, async () => {
      await db.gameStates.put({
        gameId,
        state: normalizedState,
        timestamp: now,
      });

      await db.turnLogs
        .where("gameId")
        .equals(gameId)
        .and(
          (item) =>
            item.turn < minTurn && item.log.eventCode !== "VICTORY_ACHIEVED",
        )
        .delete();

      if (prunedLogs.length > 0) {
        const logRecords = prunedLogs.map((log) => ({
          id: `${gameId}_${log.id}`,
          gameId,
          turn: log.turn,
          timestamp: log.timestamp || now,
          log,
        }));
        await db.turnLogs.bulkPut(logRecords);
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
      await db.turnLogs.where("gameId").equals(gameId).delete();
    });
  }
}
