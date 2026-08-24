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
  MilitaryPowerCalculator,
  GovernmentType,
  FinalManifestNation,
} from "@geopolitics/domain";
import { MilitaryDistributionEngine } from "@geopolitics/game-engine";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

interface ManifestRankCandidate {
  item: FinalManifestNation;
  gdp: number;
  milPower: number;
  population: number;
  ecoRank: number;
  milRank: number;
  compositeScore: number;
}

function mapManifestToNationDetails(
  manifest: FinalMapManifest | null,
): NationDetail[] {
  const manifestItems = manifest?.nations?.length
    ? manifest.nations
    : CountryRegistry.getAllManifestNations();

  const candidates: ManifestRankCandidate[] = manifestItems.map((item) => {
    const profile = CountryRegistry.getCountry(item.code || item.id);
    const tier = profile?.militaryTier ?? 5;
    const techLevel = profile?.startingTechLevel ?? item.startingTechLevel ?? 1;

    const stack = MilitaryDistributionEngine.calculateStartingStack(
      tier,
      item.hasSeaAccess,
      techLevel,
    );

    const milPower = MilitaryPowerCalculator.calculateEffectivePower(
      {
        id: item.code,
        name: item.nameFa,
        isAi: true,
        isAlive: true,
        flagCode: item.flagCode,
        taxRate: 15,
        tariffRate: 10,
        treasury: item.startingTreasury,
        nationalDebt: 0,
        industrialLevel: item.industrialLevel,
        government: {
          type:
            (item.defaultGovernment as GovernmentType) ||
            profile?.startingGovernment ||
            "DEMOCRACY",
          stability: 50,
          turnsInPower: 1,
        },
        military: stack,
        recruitmentQueue: [],
        relations: {},
        activeModifiers: [],
        globalReputation: 50,
        doctrines: { unlockedDoctrines: [] },
        executedEspionageTiers: [],
        warFocusTargetId: null,
      },
      true,
    );

    return {
      item,
      gdp: item.gdp,
      milPower,
      population: item.population,
      ecoRank: 1,
      milRank: 1,
      compositeScore: 0,
    };
  });

  const ecoSorted = [...candidates].sort((a, b) => {
    if (b.gdp !== a.gdp) return b.gdp - a.gdp;
    if (b.population !== a.population) return b.population - a.population;
    return a.item.code.localeCompare(b.item.code);
  });
  for (let i = 0; i < ecoSorted.length; i++) {
    ecoSorted[i]!.ecoRank = i + 1;
  }

  const milSorted = [...candidates].sort((a, b) => {
    if (b.milPower !== a.milPower) return b.milPower - a.milPower;
    if (b.gdp !== a.gdp) return b.gdp - a.gdp;
    return a.item.code.localeCompare(b.item.code);
  });
  for (let i = 0; i < milSorted.length; i++) {
    milSorted[i]!.milRank = i + 1;
  }

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    c.compositeScore = c.ecoRank * 3 + c.milRank * 1;
  }

  candidates.sort((a, b) => {
    if (a.compositeScore !== b.compositeScore) {
      return a.compositeScore - b.compositeScore;
    }
    if (b.gdp !== a.gdp) {
      return b.gdp - a.gdp;
    }
    if (b.population !== a.population) {
      return b.population - a.population;
    }
    return a.item.code.localeCompare(b.item.code);
  });

  return candidates.map((candidate, idx) => {
    const item = candidate.item;
    const computedRank = idx + 1;
    const summary = NationPresentationMapper.formatNationSummary(
      item.id,
      item.nameFa,
      item.code,
      item.flagCode,
      computedRank,
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
