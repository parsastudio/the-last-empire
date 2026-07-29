import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NationDetail } from "../nation-list-item";
import { NationDatabaseProvider } from "../utils/nation-database-provider";
import { GameIdGenerator } from "@/domain/shared/game-id-generator";
import { GameStateApiService } from "@/presentation/services/game-state-api.service";
import { useToast } from "@/presentation/context/toast-context";

export function useSelectNationForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const provider = useMemo(() => new NationDatabaseProvider(), []);
  const apiService = useMemo(() => new GameStateApiService(), []);

  const [presentIds, setPresentIds] = useState<Set<number> | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPresentMapIds() {
      try {
        const res = await fetch("/maps/map1/partition-mappings.json");
        if (res.ok) {
          const json = await res.json();
          if (active && json.countries && Array.isArray(json.countries)) {
            const validSet = new Set<number>();
            for (const c of json.countries) {
              if (c.id >= 11) {
                validSet.add(c.id);
              }
            }
            if (validSet.size > 0) {
              setPresentIds(validSet);
              return;
            }
          }
        }
      } catch {}

      try {
        const resDef = await fetch("/maps/map1/default-mappings.json");
        if (resDef.ok) {
          const jsonDef = await resDef.json();
          if (active && jsonDef.countries && Array.isArray(jsonDef.countries)) {
            const validSet = new Set<number>();
            for (const c of jsonDef.countries) {
              if (c.id >= 11) {
                validSet.add(c.id);
              }
            }
            if (validSet.size > 0) {
              setPresentIds(validSet);
            }
          }
        }
      } catch {}
    }

    loadPresentMapIds();

    return () => {
      active = false;
    };
  }, []);

  const allNations = useMemo(
    () => provider.getAllSelectableNations(presentIds || undefined),
    [provider, presentIds],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNation, setSelectedNation] = useState<NationDetail>(
    allNations[0]!,
  );
  const [selectedGovernment, setSelectedGovernment] = useState<string>(
    allNations[0]?.defaultGovernment || "DEMOCRACY",
  );

  useEffect(() => {
    if (
      allNations.length > 0 &&
      !allNations.some((n) => n.id === selectedNation?.id)
    ) {
      setSelectedNation(allNations[0]!);
      setSelectedGovernment(allNations[0]!.defaultGovernment);
    }
  }, [allNations, selectedNation?.id]);

  const handleSelectNationCard = useCallback((nation: NationDetail) => {
    setSelectedNation(nation);
    setSelectedGovernment(nation.defaultGovernment);
  }, []);

  const handleStartCampaign = useCallback(async () => {
    if (!selectedNation) return;

    try {
      const uniqueGameId = GameIdGenerator.generateCampaignId(
        selectedNation.id,
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("test6_human_nation_id", selectedNation.id);
      }

      const result = await apiService.selectCountry(
        selectedNation.id,
        selectedGovernment,
        uniqueGameId,
      );

      if (result.success) {
        router.push(`/play/${uniqueGameId}`);
      } else {
        showToast(
          "خطا در ایجاد کمپین",
          result.error || "خطا در راه‌اندازی کمپین جدید بازی",
          "error",
        );
      }
    } catch {
      showToast(
        "خطای شبکه",
        "ارتباط با سرور جهت ایجاد کمپین جدید برقرار نشد.",
        "error",
      );
    }
  }, [selectedNation, selectedGovernment, apiService, router, showToast]);

  return {
    allNations,
    searchQuery,
    selectedNation: selectedNation || allNations[0]!,
    selectedGovernment,
    setSearchQuery,
    setSelectedGovernment,
    handleSelectNationCard,
    handleStartCampaign,
  };
}
