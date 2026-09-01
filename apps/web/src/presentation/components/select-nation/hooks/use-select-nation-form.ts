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
import {
  CountryRegistry,
  ClientMapPathResolver,
  NationGettersUtility,
  NationRankCandidateInput,
  getProvinceGdp,
  IndustryCalculator,
} from "@geopolitics/domain";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

function mapManifestToNationDetails(
  manifest: FinalMapManifest | null,
): NationDetail[] {
  const manifestItems = manifest?.nations?.length
    ? manifest.nations
    : CountryRegistry.getAllManifestNations();

  const provincesByCountry = new Map<string, typeof manifest.provinces>();
  if (manifest?.provinces) {
    for (let i = 0; i < manifest.provinces.length; i++) {
      const p = manifest.provinces[i]!;
      const canonicalOwner = CountryRegistry.resolveCanonicalId(p.countryId);
      let list = provincesByCountry.get(canonicalOwner);
      if (!list) {
        list = [];
        provincesByCountry.set(canonicalOwner, list);
      }
      list.push(p);
    }
  }

  const computedNationStats = new Map<
    string,
    {
      actualGdp: number;
      actualPopulation: number;
      startingTreasury: number;
      domesticTechLevel: number;
      equipmentTechLevel: number;
    }
  >();

  const candidatesInput: NationRankCandidateInput[] = manifestItems.map(
    (item) => {
      const canonicalId = CountryRegistry.resolveCanonicalId(
        item.code || item.id,
      );
      const profile = CountryRegistry.getCountry(canonicalId);
      const provList = provincesByCountry.get(canonicalId) || [];

      const domesticTechLevel =
        profile?.domesticTechLevel ??
        item.startingTechLevel ??
        profile?.startingTechLevel ??
        1.0;
      const equipmentTechLevel =
        item.equipmentTechLevel ??
        profile?.equipmentTechLevel ??
        domesticTechLevel;

      let actualGdp = 0;
      let actualPopulation = 0;

      if (provList.length > 0) {
        for (let p = 0; p < provList.length; p++) {
          const prov = provList[p]!;
          actualGdp += getProvinceGdp(prov, equipmentTechLevel);
          actualPopulation += prov.population || 0;
        }
      } else {
        const defaultTotalFactories =
          IndustryCalculator.calculateStartingTotalFactories(
            item.gdp,
            equipmentTechLevel,
          );
        actualGdp =
          defaultTotalFactories *
          IndustryCalculator.calculateFactoryYield(equipmentTechLevel);
        actualPopulation = item.population;
      }

      const startingTreasury =
        item.startingTreasury ?? Math.floor(actualGdp * 0.05);

      computedNationStats.set(canonicalId, {
        actualGdp,
        actualPopulation,
        startingTreasury,
        domesticTechLevel,
        equipmentTechLevel,
      });

      return {
        id: canonicalId,
        name: item.nameFa,
        gdp: actualGdp,
        population: actualPopulation,
        domesticTechLevel,
        equipmentTechLevel,
        governmentType: item.defaultGovernment,
        stability: item.startingStability ?? 50,
        globalReputation: 50,
        navalFleet: item.hasSeaAccess && domesticTechLevel > 4.5 ? 3 : 0,
      };
    },
  );

  const rankMap =
    NationGettersUtility.calculateRankMapFromCandidates(candidatesInput);

  const sortedItems = [...manifestItems].sort((a, b) => {
    const cA = CountryRegistry.resolveCanonicalId(a.code || a.id);
    const cB = CountryRegistry.resolveCanonicalId(b.code || b.id);
    const rankA = rankMap.get(cA) ?? 999;
    const rankB = rankMap.get(cB) ?? 999;
    return rankA - rankB;
  });

  return sortedItems.map((item) => {
    const canonicalId = CountryRegistry.resolveCanonicalId(
      item.code || item.id,
    );
    const computedRank = rankMap.get(canonicalId) ?? item.initialRank;
    const stats = computedNationStats.get(canonicalId) || {
      actualGdp: item.gdp,
      actualPopulation: item.population,
      startingTreasury: item.startingTreasury ?? Math.floor(item.gdp * 0.05),
      domesticTechLevel: item.startingTechLevel ?? 1,
      equipmentTechLevel:
        item.equipmentTechLevel ?? item.startingTechLevel ?? 1,
    };

    const summary = NationPresentationMapper.formatNationSummary(
      item.id,
      item.nameFa,
      item.code,
      item.flagCode,
      computedRank,
      stats.actualGdp,
      stats.actualPopulation,
      item.defaultGovernment,
      stats.startingTreasury,
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
      desc: `شناسنامه استراتژیک رسمی ${item.nameFa} با رتبه جهانی #${computedRank}.`,
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
