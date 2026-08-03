import { useState, useEffect, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { GameStateApiService } from "@/presentation/services/game-state-api.service";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { BitPackedStorageAdapter } from "@/infrastructure/storage/final/bit-packed-storage-adapter";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";

export function useBitPackedGame(gameId = "default_game") {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = useMemo(() => new GameStateApiService(), []);
  const storageAdapter = useMemo(() => new BitPackedStorageAdapter(), []);
  const clientStorage = useMemo(() => new ClientStorageService(), []);

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

        const res = await apiService.fetchStatus("IRN", gameId);
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
          setError("خطای شبکه در راه‌اندازی کمپین WebGL");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [apiService, gameId, storageAdapter]);

  const advanceNextTurn = useCallback(async (): Promise<GameState | null> => {
    if (!gameState) return null;

    const res = await apiService.advanceTurn(gameId, gameState);
    if (res.success && res.data) {
      setGameState(res.data);
      const gridState = BitPackedGridState.getInstance();
      await storageAdapter.saveBitBuffer(gameId, gridState.getBuffer());
      await clientStorage.saveGameState(gameId, res.data);
      return res.data;
    }

    return null;
  }, [gameState, apiService, storageAdapter, clientStorage, gameId]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    advanceNextTurn,
  };
}
