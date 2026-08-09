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
      console.log(
        "[useBitPackedGame] Starting session initialization for gameId:",
        gameId,
      );
      try {
        const gridState = BitPackedGridState.getInstance();
        gridState.initializeSession(gameId);

        const buffer = gridState.getBuffer();
        const loadedBuffer = await storageAdapter.ensureBitBufferLoaded(
          gameId,
          buffer,
        );
        console.log(
          "[useBitPackedGame] BitPacked buffer load result:",
          loadedBuffer,
        );

        if (active) {
          const success = await loadGame(gameId);
          console.log("[useBitPackedGame] Game state load result:", success);
        }
      } catch (err) {
        console.error("[useBitPackedGame] Exception during init:", err);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [gameId, storageAdapter, loadGame]);

  const advanceNextTurn = useCallback(async () => {
    let nextState = null;
    try {
      console.log("[useBitPackedGame] Executing advanceNextTurn...");
      nextState = await advanceTurnAction();
      if (nextState) {
        const gridState = BitPackedGridState.getInstance();
        if (gridState.isStorageDirty()) {
          const bitBuffer = gridState.getBuffer();
          gridState.clearStorageDirty();
          void storageAdapter.saveBitBuffer(gameId, bitBuffer);
        }
      }
    } catch (err) {
      console.error(
        "[useBitPackedGame] Exception during advanceNextTurn:",
        err,
      );
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
