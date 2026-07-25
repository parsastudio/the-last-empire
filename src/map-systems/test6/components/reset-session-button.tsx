import { useState, useEffect, useCallback } from "react";
import { PlayerSessionManager } from "../engine/player-session-manager";

export function useSessionState() {
  const [playerNationId, setPlayerNationId] = useState<string | null>(null);
  const [sessionManager] = useState(() => new PlayerSessionManager());

  useEffect(() => {
    const stored = sessionManager.getPlayerNationId();
    if (stored) {
      setPlayerNationId(stored);
    }
  }, [sessionManager]);

  const resetSession = useCallback(() => {
    sessionManager.clearSession();
    setPlayerNationId(null);
  }, [sessionManager]);

  return {
    playerNationId,
    setPlayerNationId,
    resetSession,
  };
}
