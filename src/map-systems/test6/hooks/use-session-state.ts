import { useState, useCallback } from "react";
import { PlayerSessionManager } from "../engine/player-session-manager";

export function useSessionState() {
  const [sessionManager] = useState(() => new PlayerSessionManager());
  const [playerNationId, setPlayerNationId] = useState<string | null>(() => {
    return sessionManager.getPlayerNationId();
  });

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
