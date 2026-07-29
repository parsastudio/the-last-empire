"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { GameStateApiService } from "@/presentation/services/game-state-api.service";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";

export function useGeopoliticsGame(customGameId?: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = useMemo(() => new GameStateApiService(), []);
  const storageService = useMemo(() => new ClientStorageService(), []);

  const getStoredNationId = useCallback((): string => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("test6_human_nation_id") || "IRN";
    }
    return "IRN";
  }, []);

  const fetchStatus = useCallback(async () => {
    const nationId = getStoredNationId();
    const result = await apiService.fetchStatus(nationId, customGameId);
    if (result.success && result.data) {
      setGameState(result.data);
    } else {
      setError(result.error || "خطا در دریافت وضعیت بازی");
    }
    setLoading(false);
  }, [apiService, customGameId, getStoredNationId]);

  const advanceNextTurn = useCallback(async (): Promise<GameState | null> => {
    const activeId = customGameId || gameState?.gameId;
    const result = await apiService.advanceTurn(activeId, gameState);
    if (result.success && result.data) {
      setGameState(result.data);
      return result.data;
    }
    return null;
  }, [apiService, customGameId, gameState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStateUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GameState>;
      if (customEvent.detail) {
        setGameState(customEvent.detail);
      }
    };

    window.addEventListener("geopolitics-state-updated", handleStateUpdate);
    return () => {
      window.removeEventListener(
        "geopolitics-state-updated",
        handleStateUpdate,
      );
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialStatus() {
      const nationId = getStoredNationId();

      if (customGameId) {
        try {
          const savedState = await storageService.loadGameState(customGameId);
          if (savedState && active) {
            await apiService.syncState(savedState);
            setGameState(savedState);
            setLoading(false);
            return;
          }
        } catch {}
      }

      const result = await apiService.fetchStatus(nationId, customGameId);
      if (active) {
        if (result.success && result.data) {
          setGameState(result.data);
        } else {
          setError(result.error || "خطا در دریافت وضعیت بازی");
        }
        setLoading(false);
      }
    }

    loadInitialStatus();

    return () => {
      active = false;
    };
  }, [apiService, customGameId, getStoredNationId, storageService]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    refreshStatus: fetchStatus,
    advanceNextTurn,
  };
}
