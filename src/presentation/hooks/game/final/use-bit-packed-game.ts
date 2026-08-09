import { useEffect, useCallback, useMemo } from "react";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";

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

  useEffect(() => {
    if (gameState && gameState.provinces) {
      const buffer = BitPackedGridState.getInstance().getBuffer();
      const updatedProvinces =
        ProvincePixelCalculator.syncProvincesMapPixelCounts(
          buffer,
          gameState.provinces,
        );

      if (updatedProvinces !== gameState.provinces) {
        setGameState({
          ...gameState,
          provinces: updatedProvinces,
        });
      }
    }
  }, [gameState, setGameState]);

  const advanceNextTurn = useCallback(async () => {
    let nextState = null;
    try {
      nextState = await advanceTurnAction();
      if (nextState) {
        const gridState = BitPackedGridState.getInstance();
        if (gridState.isStorageDirty()) {
          const bitBuffer = gridState.getBuffer();
          gridState.clearStorageDirty();
          void storageAdapter.saveBitBuffer(gameId, bitBuffer);
        }
      }
    } catch {}
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
