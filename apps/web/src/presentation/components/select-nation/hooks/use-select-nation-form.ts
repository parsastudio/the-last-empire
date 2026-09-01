"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { useToast } from "@/presentation/context/toast-context";
import {
  BitPackedInitService,
  FinalMapManifest,
} from "@/presentation/components/select-nation/services/bit-packed-init-service";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { CountryRegistry, ClientMapPathResolver } from "@geopolitics/domain";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

function mapManifestToNationDetails(
  manifest: FinalMapManifest | null,
): NationDetail[] {
  const manifestItems = manifest?.nations?.length
    ? manifest.nations
    : CountryRegistry.getAllManifestNations();

  if (!manifestItems || manifestItems.length === 0) {
    const profiles = CountryRegistry.getAllProfiles();
    return profiles.map((p, idx) => {
      const gdp = p.gdp || 50_000_000_000;
      const pop = p.population || 10_000_000;
      const treasury = Math.floor(gdp * 0.05);
      const rank = idx + 1;
      const gov = p.startingGovernment || "PLURALIST_PARLIAMENTARY";

      const summary = NationPresentationMapper.formatNationSummary(
        p.code,
        p.nameFa,
        p.code,
        p.flagCode,
        rank,
        gdp,
        pop,
        gov,
        treasury,
      );

      return {
        id: p.code,
        name: summary.name,
        code: summary.code,
        rank: summary.rank,
        power: summary.powerLabel,
        gdp: summary.gdpText,
        population: summary.populationText,
        treasury: summary.treasuryText,
        desc: `شناسنامه استراتژیک رسمی ${p.nameFa} با رتبه جهانی #${rank}.`,
        defaultGovernment: gov,
      };
    });
  }

  const sortedItems = [...manifestItems].sort(
    (a, b) => (a.initialRank || 999) - (b.initialRank || 999),
  );

  return sortedItems.map((item) => {
    const canonicalId = CountryRegistry.resolveCanonicalId(
      item.code || item.id,
    );
    const profile = CountryRegistry.getCountry(canonicalId);

    const gdp = item.gdp ?? profile?.gdp ?? 50_000_000_000;
    const population = item.population ?? profile?.population ?? 10_000_000;
    const treasury =
      item.startingTreasury ??
      (profile?.gdp ? Math.floor(gdp * 0.05) : Math.floor(gdp * 0.05));
    const rank = item.initialRank || 1;
    const gov =
      item.defaultGovernment ||
      profile?.startingGovernment ||
      "PLURALIST_PARLIAMENTARY";

    const summary = NationPresentationMapper.formatNationSummary(
      canonicalId,
      item.nameFa || profile?.nameFa || canonicalId,
      item.code || canonicalId,
      item.flagCode || profile?.flagCode || canonicalId,
      rank,
      gdp,
      population,
      gov,
      treasury,
    );

    return {
      id: canonicalId,
      name: summary.name,
      code: summary.code,
      rank: summary.rank,
      power: summary.powerLabel,
      gdp: summary.gdpText,
      population: summary.populationText,
      treasury: summary.treasuryText,
      desc: `شناسنامه استراتژیک رسمی ${summary.name} با رتبه جهانی #${rank}.`,
      defaultGovernment: gov,
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
        const manifestUrl = ClientMapPathResolver.getMapStrategicClientUrl(
          "map1",
          "manifest.json",
        );
        const res = await fetch(manifestUrl, {
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
    return selectedNation
      ? selectedNation.defaultGovernment
      : "PLURALIST_PARLIAMENTARY";
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
