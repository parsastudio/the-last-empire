import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { GameIdGenerator } from "@/domain/shared/domain-utilities";
import { GameStateApiService } from "@/presentation/services/game-state-api.service";
import { useToast } from "@/presentation/context/toast-context";
import { FinalMapManifest as MapManifest } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { STORAGE_KEYS } from "@/infrastructure/storage/storage-keys.config";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { BitPackedInitService } from "@/infrastructure/map-preprocessing/final/bit-packed-init-service";
import { BitPackedStorageAdapter } from "@/infrastructure/storage/final/bit-packed-storage-adapter";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { NationDatabaseProvider } from "@/presentation/components/select-nation/services/nation-database-provider";

export function useSelectNationForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const provider = useMemo(() => new NationDatabaseProvider(), []);
  const apiService = useMemo(() => new GameStateApiService(), []);
  const storageService = useMemo(() => new ClientStorageService(), []);
  const storageAdapter = useMemo(() => new BitPackedStorageAdapter(), []);

  const [manifest, setManifest] = useState<MapManifest | null>(null);

  useEffect(() => {
    let active = true;

    async function loadManifest() {
      try {
        const res = await fetch("/api/map-preprocessing/final-manifest");
        if (res.ok) {
          const json = await res.json();
          if (active && json.nations) {
            setManifest(json);
          }
        }
      } catch {}
    }

    loadManifest();

    return () => {
      active = false;
    };
  }, []);

  const allNations = useMemo(() => {
    if (manifest && manifest.nations) {
      return provider.getNationsFromManifest(
        manifest.nations as unknown as Parameters<
          typeof provider.getNationsFromManifest
        >[0],
      );
    }
    return provider.getAllSelectableNations();
  }, [provider, manifest]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
  const [userSelectedGovernment, setUserSelectedGovernment] = useState<
    string | null
  >(null);

  const selectedNation = useMemo(() => {
    if (selectedNationId) {
      const found = allNations.find((n) => n.id === selectedNationId);
      if (found) return found;
    }
    return allNations[0]!;
  }, [allNations, selectedNationId]);

  const selectedGovernment = useMemo(() => {
    if (userSelectedGovernment) {
      return userSelectedGovernment;
    }
    return selectedNation ? selectedNation.defaultGovernment : "DEMOCRACY";
  }, [userSelectedGovernment, selectedNation]);

  const handleSelectNationCard = useCallback((nation: NationDetail) => {
    setSelectedNationId(nation.id);
    setUserSelectedGovernment(nation.defaultGovernment);
  }, []);

  const setSelectedGovernment = useCallback((gov: string) => {
    setUserSelectedGovernment(gov);
  }, []);

  const handleStartCampaign = useCallback(async () => {
    if (!selectedNation) return;

    try {
      const uniqueGameId = GameIdGenerator.generateCampaignId(
        selectedNation.id,
      );

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.HUMAN_NATION_ID, selectedNation.id);
      }

      await BitPackedInitService.initializeBitPackedSession(uniqueGameId);
      const gridState = BitPackedGridState.getInstance();
      await storageAdapter.saveBitBuffer(uniqueGameId, gridState.getBuffer());

      const result = await apiService.selectCountry(
        selectedNation.id,
        selectedGovernment,
        uniqueGameId,
      );

      if (result.success && result.data) {
        await storageService.saveGameState(uniqueGameId, result.data);
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
  }, [
    selectedNation,
    selectedGovernment,
    apiService,
    storageService,
    storageAdapter,
    router,
    showToast,
  ]);

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
