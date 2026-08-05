import { useState, useEffect, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { ClientGameService } from "@/presentation/services/client-game.service";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { BitPackedStorageAdapter } from "@/infrastructure/storage/final/bit-packed-storage-adapter";
import { AsyncSaveQueueService } from "@/infrastructure/storage/async-save-queue.service";
import { CampaignSessionCache } from "@/infrastructure/storage/campaign-session-cache";

export function useBitPackedGame(gameId = "default_game") {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    return CampaignSessionCache.get(gameId);
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !CampaignSessionCache.has(gameId);
  });
  const [error, setError] = useState<string | null>(null);

  const gameService = useMemo(() => new ClientGameService(), []);
  const storageAdapter = useMemo(() => new BitPackedStorageAdapter(), []);
  const saveQueue = useMemo(() => AsyncSaveQueueService.getInstance(), []);

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

        const cached = CampaignSessionCache.get(gameId);
        if (cached) {
          if (active) {
            setGameState(cached);
            setLoading(false);
          }
          return;
        }

        const res = await gameService.loadGameState(gameId);
        if (active) {
          if (res.success && res.data) {
            CampaignSessionCache.set(gameId, res.data);
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
      CampaignSessionCache.set(gameId, res.data);
      setGameState(res.data);
      saveQueue.enqueueSave(gameId, res.data, true);
      return res.data;
    }

    return null;
  }, [gameState, gameService, saveQueue, gameId]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    advanceNextTurn,
  };
}
