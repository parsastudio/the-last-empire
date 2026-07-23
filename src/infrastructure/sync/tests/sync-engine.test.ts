import { SyncEngine } from "../sync-engine";
import type { StateStorageAdapter } from "../sync-engine";
import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export function runSyncEngineTest(): boolean {
  const mockDbAdapter: StateStorageAdapter = {
    saveState: async (_gameId: string, _state: GameState): Promise<void> => {
      return Promise.resolve();
    },
    loadState: async (_gameId: string): Promise<GameState | null> => {
      return Promise.resolve(null);
    },
  };

  const sync = new SyncEngine(mockDbAdapter);

  const templateState = {
    gameId: "SYNC_TEST_GAME",
    currentTurn: 1,
    seed: 12345,
    isGameOver: false,
    humanNationId: "USA",
    globalThreatLevel: 0,
    marketPrices: { oil: 100, steel: 100 },
    nations: {},
    turnLogs: [],
    eventFlags: {},
  } as unknown as GameState;

  sync.queueStateSync(templateState);

  const deltaPack = sync.getDeltaPacket(templateState) as {
    changes: { fullState?: unknown };
  };
  const deltaIsValid = deltaPack.changes.fullState !== undefined;

  return deltaIsValid;
}
