import { useState, useEffect, useCallback, useMemo } from "react";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

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
        await ClientFinalStateLoader.ensureManifestLoaded("map1");

        let targetGameId = gameId;

        if (targetGameId === "default" || targetGameId === "default_game") {
          const activeStoreId = useGameStore.getState().activeGameId;
          if (
            activeStoreId &&
            activeStoreId !== "default" &&
            activeStoreId !== "default_game"
          ) {
            targetGameId = activeStoreId;
          } else {
            const allSaves = await storageAdapter.getAllSaves();
            if (allSaves.length > 0 && allSaves[0]) {
              targetGameId = allSaves[0].gameId;
            }
          }
        }

        const gridState = BitPackedGridState.getInstance();
        gridState.initializeSession(targetGameId);

        const buffer = gridState.getBuffer();
        await storageAdapter.ensureBitBufferLoaded(buffer);

        if (active) {
          const currentMemoryState = useGameStore.getState().gameState;
          if (
            currentMemoryState &&
            currentMemoryState.gameId === targetGameId &&
            !useGameStore.getState().error
          ) {
            setIsInitializing(false);
            return;
          }

          await loadGame(targetGameId);
        }
      } catch (err) {
        console.error("useBitPackedGame initialization error:", err);
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
