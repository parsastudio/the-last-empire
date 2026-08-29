import { useState, useEffect, useCallback } from "react";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export interface SavedCampaignMeta {
  id: string;
  title: string;
  turn: number;
  date: string;
  time: string;
}

export function useSavedCampaigns() {
  const [saves, setSaves] = useState<SavedCampaignMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSavesFromDb = useCallback(async () => {
    try {
      const adapter = new GameStorageAdapter();
      const records = await adapter.getAllSaves();

      const mapped: SavedCampaignMeta[] = [];

      for (const rec of records) {
        if (rec.gameId === "active_game") continue;
        const state = rec.state;
        const humanNation = state.nations[state.humanNationId];
        const nationName = humanNation ? humanNation.name : state.humanNationId;
        const saveDate = new Date(rec.timestamp);

        mapped.push({
          id: state.gameId,
          title: `کمپین ${state.gameId} - ${nationName}`,
          turn: state.currentTurn,
          date: saveDate.toLocaleDateString("fa-IR"),
          time: saveDate.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      setSaves(mapped);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      if (active) {
        await loadSavesFromDb();
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [loadSavesFromDb]);

  const deleteSave = useCallback(async (gameId: string) => {
    try {
      const adapter = new GameStorageAdapter();
      await adapter.deleteState(gameId);
      setSaves((prev) => prev.filter((s) => s.id !== gameId));
    } catch {}
  }, []);

  return { saves, loading, deleteSave };
}
