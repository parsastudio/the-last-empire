"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { useToast } from "@/presentation/context/toast-context";
import {
  BitPackedInitService,
  FinalMapManifest,
} from "@/infrastructure/map-preprocessing/runtime/bit-packed-init-service";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { CountryRegistry } from "@/domain/data/countries";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

function mapManifestToNationDetails(
  manifest: FinalMapManifest | null,
): NationDetail[] {
  const manifestItems = manifest?.nations?.length
    ? manifest.nations
    : CountryRegistry.getAllManifestNations();

  return manifestItems.map((item) => {
    const summary = NationPresentationMapper.formatNationSummary(
      item.id,
      item.nameFa,
      item.code,
      item.flagCode,
      item.initialRank,
      item.gdp,
      item.population,
      item.defaultGovernment,
    );

    return {
      id: item.id,
      name: summary.name,
      code: summary.code,
      rank: summary.rank,
      power: summary.powerLabel,
      gdp: summary.gdpText,
      population: summary.populationText,
      treasury: summary.treasuryText,
      desc: `شناسنامه استراتژیک رسمی ${item.nameFa} با رتبه جهانی #${item.initialRank}.`,
      defaultGovernment: item.defaultGovernment,
    };
  });
}

export function useSelectNationForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const createCampaignStore = useGameStore((state) => state.createCampaign);

  const [manifest, setManifest] = useState<FinalMapManifest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
  const [userSelectedGovernment, setUserSelectedGovernment] = useState<
    string | null
  >(null);

  useEffect(() => {
    let active = true;

    async function loadManifest() {
      try {
        const res = await fetch("/maps/map1/temp/final/manifest.json", {
          cache: "no-store",
        });
        if (res.ok) {
          const json: FinalMapManifest = await res.json();
          if (
            active &&
            json &&
            Array.isArray(json.nations) &&
            json.nations.length > 0
          ) {
            CountryRegistry.initializeFromManifest(json);
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

  const allNations = useMemo(
    () => mapManifestToNationDetails(manifest),
    [manifest],
  );

  const selectedNation = useMemo<NationDetail | null>(() => {
    if (!allNations || allNations.length === 0) return null;
    if (selectedNationId) {
      const found = allNations.find((n) => n.id === selectedNationId);
      if (found) return found;
    }
    return allNations[0] ?? null;
  }, [allNations, selectedNationId]);

  const selectedGovernment = useMemo(() => {
    if (userSelectedGovernment) return userSelectedGovernment;
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
      const { gameId } = await BitPackedInitService.initializeBitPackedSession(
        selectedNation.id,
      );
      const success = await createCampaignStore(
        selectedNation.id,
        selectedGovernment,
        gameId,
        manifest,
      );

      if (success) {
        router.push(`/play/${gameId}`);
      } else {
        showToast(
          "خطا در ایجاد کمپین",
          "خطا در راه‌اندازی کمپین جدید بازی",
          "error",
        );
      }
    } catch {
      showToast(
        "خطا در ایجاد کمپین",
        "امکان ذخیره پرونده کمپین جدید در حافظه وجود ندارد.",
        "error",
      );
    }
  }, [
    selectedNation,
    selectedGovernment,
    createCampaignStore,
    manifest,
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
