"use client";

import { useState, useEffect, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { LocalStorageAdapter } from "@/infrastructure/storage/local-storage-adapter";

export function useGeopoliticsGame(customGameId?: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getStoredNationId = (): string => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("test6_human_nation_id") || "IRN";
    }
    return "IRN";
  };

  const fetchStatus = useCallback(async () => {
    try {
      const nationId = getStoredNationId();
      const gameIdQuery = customGameId ? `&gameId=${customGameId}` : "";
      const res = await fetch(
        `/api/game/status?nationId=${nationId}${gameIdQuery}`,
      );
      const json = await res.json();
      if (json.success && json.data) {
        setGameState(json.data);
      } else {
        setError(json.error || "خطا در دریافت وضعیت بازی");
      }
    } catch {
      setError("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [customGameId]);

  const advanceNextTurn = useCallback(async () => {
    try {
      const activeId = customGameId || gameState?.gameId;
      const gameIdQuery = activeId ? `?gameId=${activeId}` : "";
      const res = await fetch(`/api/game/next-turn${gameIdQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: gameState }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGameState(json.data);
        return json.data as GameState;
      }
    } catch {
      return null;
    }
    return null;
  }, [customGameId, gameState]);

  useEffect(() => {
    let active = true;

    async function loadInitialStatus() {
      try {
        const nationId = getStoredNationId();

        if (customGameId) {
          try {
            const dbAdapter = new IndexedDbAdapter();
            let savedState = await dbAdapter.loadState(customGameId);

            if (!savedState) {
              const localAdapter = new LocalStorageAdapter();
              savedState = localAdapter.loadState(customGameId);
            }

            if (savedState && active) {
              await fetch("/api/game/sync-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: savedState }),
              });

              setGameState(savedState);
              setLoading(false);
              return;
            }
          } catch {}
        }

        const gameIdQuery = customGameId ? `&gameId=${customGameId}` : "";
        const res = await fetch(
          `/api/game/status?nationId=${nationId}${gameIdQuery}`,
        );
        const json = await res.json();
        if (active) {
          if (json.success && json.data) {
            setGameState(json.data);
          } else {
            setError(json.error || "خطا در دریافت وضعیت بازی");
          }
          setLoading(false);
        }
      } catch {
        if (active) {
          setError("خطای ارتباط با سرور");
          setLoading(false);
        }
      }
    }

    loadInitialStatus();

    return () => {
      active = false;
    };
  }, [customGameId]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    refreshStatus: fetchStatus,
    advanceNextTurn,
  };
}
