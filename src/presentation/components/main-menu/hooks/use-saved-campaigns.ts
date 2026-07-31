import { useState, useEffect } from "react";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { StateSerializer } from "@/infrastructure/storage/state-serializer";

export interface SavedCampaignMeta {
  id: string;
  title: string;
  turn: number;
  date: string;
  humanNationId: string;
}

export function useSavedCampaigns() {
  const [saves, setSaves] = useState<SavedCampaignMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadSavesFromDb() {
      try {
        const adapter = new IndexedDbAdapter();
        const serializer = new StateSerializer();
        const records = await adapter.getAllSaves();

        if (active) {
          const mapped: SavedCampaignMeta[] = [];

          for (const rec of records) {
            if (rec.gameId === "active_game") continue;
            try {
              const state = serializer.deserialize(rec.data);
              const humanNation = state.nations[state.humanNationId];
              const nationName = humanNation
                ? humanNation.name
                : state.humanNationId;

              mapped.push({
                id: state.gameId,
                title: `کمپین ${state.gameId} - ${nationName}`,
                turn: state.currentTurn,
                date: new Date(rec.timestamp).toLocaleDateString("fa-IR"),
                humanNationId: state.humanNationId,
              });
            } catch {}
          }

          setSaves(mapped);
        }
      } catch {
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSavesFromDb();

    return () => {
      active = false;
    };
  }, []);

  return { saves, loading };
}
