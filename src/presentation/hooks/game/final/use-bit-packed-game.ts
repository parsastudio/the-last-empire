import { useEffect, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";
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
        const buffer = gridState.getBuffer();

        const loadedFromStorage = await storageAdapter.loadBitBuffer(
          gameId,
          buffer,
        );

        if (!loadedFromStorage) {
          await FinalStateLoader.loadLiveStateBuffer("map1");
        }

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

  const advanceNextTurn = useCallback(async (): Promise<GameState | null> => {
    const nextState = await advanceTurnAction();
    if (nextState) {
      const gridState = BitPackedGridState.getInstance();
      await storageAdapter.saveBitBuffer(gameId, gridState.getBuffer());
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
