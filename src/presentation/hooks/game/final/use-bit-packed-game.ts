import { useEffect, useCallback, useMemo } from "react";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { useGameStore } from "@/presentation/stores/use-game-store";

export function useBitPackedGame(gameId = "default_game") {
  const gameState = useGameStore((state) => state.gameState);
  const loading = useGameStore((state) => state.loading);
  const error = useGameStore((state) => state.error);

  const setGameState = useGameStore((state) => state.setGameState);
  const loadGame = useGameStore((state) => state.loadGame);
  const advanceTurnAction = useGameStore((state) => state.advanceNextTurn);

  const storageAdapter = useMemo(() => new GameStorageAdapter(), []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const gridState = BitPackedGridState.getInstance();
        gridState.initializeSession(gameId);

        const buffer = gridState.getBuffer();
        await storageAdapter.ensureBitBufferLoaded(gameId, buffer);

        if (active) {
          await loadGame(gameId);
        }
      } catch {}
    }

    init();

    return () => {
      active = false;
    };
  }, [gameId, storageAdapter, loadGame]);

  const advanceNextTurn = useCallback(async () => {
    console.time("advanceNextTurn-total");
    console.log("[advanceNextTurn] Starting...");
    let nextState = null;
    try {
      console.time("advanceTurnAction-exec");
      nextState = await advanceTurnAction();
      console.timeEnd("advanceTurnAction-exec");
      console.log(
        "[advanceNextTurn] advanceTurnAction result:",
        nextState ? "success" : "null",
      );
      if (nextState) {
        const gridState = BitPackedGridState.getInstance();
        if (gridState.isStorageDirty()) {
          console.time("saveBitBuffer");
          await storageAdapter.saveBitBuffer(gameId, gridState.getBuffer());
          gridState.clearStorageDirty();
          console.timeEnd("saveBitBuffer");
        } else {
          console.log("[BitBuffer] Skipped writing unchanged buffer to disk.");
        }
      }
    } catch (error) {
      console.error("[advanceNextTurn] Error:", error);
    } finally {
      console.timeEnd("advanceNextTurn-total");
    }
    return nextState;
  }, [gameId, advanceTurnAction, storageAdapter]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    advanceNextTurn,
  };
}
