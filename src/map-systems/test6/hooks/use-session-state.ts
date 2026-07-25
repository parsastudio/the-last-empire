import { useState, useCallback, useEffect } from "react";
import { PlayerSessionManager } from "../engine/player-session-manager";

export function useSessionState() {
  const [sessionManager] = useState(() => new PlayerSessionManager());
  const [playerNationId, setPlayerNationId] = useState<string | null>(null);

  useEffect(() => {
    const activeId = sessionManager.getPlayerNationId();
    requestAnimationFrame(() => {
      setPlayerNationId(activeId);
    });
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
