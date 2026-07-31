import { useState, useEffect, useCallback, useMemo } from "react";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";

export interface SavedCampaignMeta {
  id: string;
  title: string;
  turn: number;
  date: string;
  time: string;
  humanNationId: string;
  timestamp: number;
}

export function useSavedCampaigns() {
  const [saves, setSaves] = useState<SavedCampaignMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const storageService = useMemo(() => new ClientStorageService(), []);
  const serializer = useMemo(() => new StateSerializer(), []);

  const loadSaves = useCallback(async () => {
    try {
      setLoading(true);
      const records = await storageService.getAllSavedCampaigns();

      const mapped: SavedCampaignMeta[] = [];

      for (const rec of records) {
        if (rec.gameId === "active_game") continue;
        try {
          const state = serializer.deserialize(rec.data);
          const humanNation = state.nations[state.humanNationId];
          const nationName = humanNation
            ? humanNation.name
            : state.humanNationId;

          const dateObj = new Date(rec.timestamp);
          const dateStr = dateObj.toLocaleDateString("fa-IR");
          const timeStr = dateObj.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          mapped.push({
            id: state.gameId,
            title: `کمپین ${state.gameId} - ${nationName}`,
            turn: state.currentTurn,
            date: dateStr,
            time: timeStr,
            humanNationId: state.humanNationId,
            timestamp: rec.timestamp,
          });
        } catch {}
      }

      mapped.sort((a, b) => b.timestamp - a.timestamp);
      setSaves(mapped);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [storageService, serializer]);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  const deleteSave = useCallback(
    async (saveId: string) => {
      try {
        await storageService.removeGameState(saveId);
        setSaves((prev) => prev.filter((s) => s.id !== saveId));
      } catch {}
    },
    [storageService],
  );

  return { saves, loading, deleteSave, refreshSaves: loadSaves };
}
