import { useState, useMemo, useCallback } from "react";
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

  const allNations = useMemo(
    () => provider.getAllSelectableNations(),
    [provider],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNation, setSelectedNation] = useState<NationDetail>(
    allNations[0]!,
  );
  const [selectedGovernment, setSelectedGovernment] = useState<string>(
    allNations[0]!.defaultGovernment,
  );

  const handleSelectNationCard = useCallback((nation: NationDetail) => {
    setSelectedNation(nation);
    setSelectedGovernment(nation.defaultGovernment);
  }, []);

  const handleStartCampaign = useCallback(async () => {
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
  }, [selectedNation.id, selectedGovernment, apiService, router, showToast]);

  return {
    allNations,
    searchQuery,
    selectedNation,
    selectedGovernment,
    setSearchQuery,
    setSelectedGovernment,
    handleSelectNationCard,
    handleStartCampaign,
  };
}
