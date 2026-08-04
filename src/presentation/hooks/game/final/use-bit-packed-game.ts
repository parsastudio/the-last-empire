import { useState, useEffect, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { ClientGameService } from "@/presentation/services/client-game.service";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { BitPackedStorageAdapter } from "@/infrastructure/storage/final/bit-packed-storage-adapter";

export function useBitPackedGame(gameId = "default_game") {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const gameService = useMemo(() => new ClientGameService(), []);
  const storageAdapter = useMemo(() => new BitPackedStorageAdapter(), []);

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

        const res = await gameService.loadGameState(gameId);
        if (active) {
          if (res.success && res.data) {
            setGameState(res.data);
          } else {
            setError(res.error || "خطا در بارگذاری استیت");
          }
          setLoading(false);
        }
      } catch {
        if (active) {
          setError("خطا در راه‌اندازی کمپین بازی");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [gameService, gameId, storageAdapter]);

  const advanceNextTurn = useCallback(async (): Promise<GameState | null> => {
    if (!gameState) return null;

    const res = await gameService.advanceTurn(gameId, gameState);
    if (res.success && res.data) {
      setGameState(res.data);
      const gridState = BitPackedGridState.getInstance();
      await storageAdapter.saveBitBuffer(gameId, gridState.getBuffer());
      return res.data;
    }

    return null;
  }, [gameState, gameService, storageAdapter, gameId]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    advanceNextTurn,
  };
}
