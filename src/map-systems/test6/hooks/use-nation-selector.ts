import { useState, useCallback } from "react";
import { PlayerSessionManager } from "../engine/player-session-manager";

export function useNationSelector(
  onSelectionSuccess: (nationId: string) => void,
) {
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [sessionManager] = useState(() => new PlayerSessionManager());

  const selectNation = useCallback(
    async (nationId: string, nationName: string) => {
      if (typeof window === "undefined") {
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to govern ${nationName} (${nationId})?`,
      );

      if (confirmed) {
        sessionManager.setPlayerNationId(nationId);
        setSelectedNation(nationId);
        onSelectionSuccess(nationId);

        await fetch("/api/map-test6/select-country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationId }),
        });
      }
    },
    [sessionManager, onSelectionSuccess],
  );

  return {
    selectedNation,
    selectNation,
  };
}
