import { useState, useEffect, useCallback, useMemo } from "react";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { useGameStore } from "@/presentation/stores/use-game-store";

export function useBitPackedGame(gameId = "default_game") {
  const gameState = useGameStore((state) => state.gameState);
  const storeLoading = useGameStore((state) => state.loading);
  const error = useGameStore((state) => state.error);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const loadGame = useGameStore((state) => state.loadGame);
  const advanceTurnAction = useGameStore((state) => state.advanceNextTurn);

  const storageAdapter = useMemo(() => new GameStorageAdapter(), []);

  useEffect(() => {
    let active = true;

    async function init() {
      setIsInitializing(true);
      try {
        const gridState = BitPackedGridState.getInstance();
        gridState.initializeSession(gameId);

        const buffer = gridState.getBuffer();
        await storageAdapter.ensureBitBufferLoaded(buffer);

        if (active) {
          await loadGame(gameId);
        }
      } catch {
      } finally {
        if (active) {
          setIsInitializing(false);
        }
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
      nextState = await advanceTurnAction();
    } catch {}
    return nextState;
  }, [advanceTurnAction]);

  const loading = isInitializing || storeLoading;

  return {
    gameState,
    loading,
    error,
    advanceNextTurn,
  };
}
