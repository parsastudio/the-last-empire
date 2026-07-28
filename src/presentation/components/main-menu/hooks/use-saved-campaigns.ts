import { useState, useEffect } from "react";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";

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
        const mainState = await adapter.loadState("active_game");
        if (active && mainState) {
          const humanNation = mainState.nations[mainState.humanNationId];
          const nationName = humanNation
            ? humanNation.name
            : mainState.humanNationId;
          const meta: SavedCampaignMeta = {
            id: mainState.gameId,
            title: `کمپین فعال - حاکمیت ${nationName}`,
            turn: mainState.currentTurn,
            date: new Date().toLocaleDateString("fa-IR"),
            humanNationId: mainState.humanNationId,
          };
          setSaves([meta]);
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
