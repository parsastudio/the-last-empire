import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";

export function useTurnLogs(state: GameState | null) {
  const filteredLogs = useMemo(() => {
    if (!state) {
      return [];
    }
    return state.turnLogs;
  }, [state]);

  return {
    filteredLogs,
  };
}
