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
        console.group(`🚀 [DIAGNOSTIC] Session Init for gameId: ${gameId}`);
        const gridState = BitPackedGridState.getInstance();
        gridState.initializeSession(gameId);

        const buffer = gridState.getBuffer();
        const success = await storageAdapter.ensureBitBufferLoaded(
          gameId,
          buffer,
        );

        console.info(
          "Map bit buffer loading result:",
          success ? "SUCCESS" : "FAILED",
        );
        console.groupEnd();

        if (active) {
          await loadGame(gameId);
        }
      } catch (err) {
        console.error("❌ ERROR initializing bit packed session:", err);
        console.groupEnd();
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [gameId, storageAdapter, loadGame]);

  const advanceNextTurn = useCallback(async () => {
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
