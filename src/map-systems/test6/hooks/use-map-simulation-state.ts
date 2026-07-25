import { useState, useEffect, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";

export function useMapSimulationState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch("/api/map-test6/status");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setGameState(json.data);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  return {
    gameState,
    loading,
    refreshState,
  };
}
