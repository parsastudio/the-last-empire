"use client";

import { useState, useEffect, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";

export function useGeopoliticsGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/game/status");
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
  }, []);

  const advanceNextTurn = useCallback(async () => {
    try {
      const res = await fetch("/api/game/next-turn", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setGameState(json.data);
        return json.data as GameState;
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    gameState,
    setGameState,
    loading,
    error,
    refreshStatus: fetchStatus,
    advanceNextTurn,
  };
}
