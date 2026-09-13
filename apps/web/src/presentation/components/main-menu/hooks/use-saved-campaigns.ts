import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { CountryRegistry } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

export interface SavedCampaignMeta {
  id: string;
  title: string;
  turn: number;
  date: string;
  time: string;
}

export function useSavedCampaigns() {
  const t = useTranslations("menu.saves");
  const { locale, formatCountryName } = useLocaleFormatter();
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
        const canonicalHuman = CountryRegistry.resolveCanonicalId(
          state.humanNationId,
        );
        const humanNation =
          state.nations[canonicalHuman] || state.nations[state.humanNationId];

        const nationName = formatCountryName(humanNation || canonicalHuman);

        const saveDate = new Date(rec.timestamp);
        const dateLocale = locale === "en" ? "en-US" : "fa-IR";

        const title = t("campaignTitle", {
          gameId: state.gameId,
          nationName,
        });

        mapped.push({
          id: state.gameId,
          title,
          turn: state.currentTurn,
          date: saveDate.toLocaleDateString(dateLocale),
          time: saveDate.toLocaleTimeString(dateLocale, {
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
  }, [locale, t, formatCountryName]);

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
