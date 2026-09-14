"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { useToast } from "@/presentation/context/toast-context";
import {
  BitPackedInitService,
  FinalMapManifest,
} from "@/presentation/components/select-nation/services/bit-packed-init-service";
import { useGameStore } from "@/presentation/stores/use-game-store";
import {
  CountryRegistry,
  GameDifficulty,
  MapTopologyRegistry,
  ECONOMY_CONFIG,
} from "@geopolitics/domain";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

function createNationDetailItem(
  canonicalId: string,
  rawCode: string,
  flagCode: string | undefined,
  rank: number,
  gdp: number,
  population: number,
  treasury: number | undefined,
  defaultGovernment: string,
  formatCountryName: (code: string) => string,
  tPowerTiers: (key: string) => string,
  tDossier: (values: { name: string; rank: number }) => string,
): NationDetail {
  const powerTierKey = NationPresentationMapper.getPowerTierKey(gdp);
  const powerLabel = tPowerTiers(powerTierKey);
  const displayName = formatCountryName(canonicalId);

  const summary = NationPresentationMapper.formatNationSummary(
    canonicalId,
    rawCode,
    flagCode || canonicalId,
    rank,
    gdp,
    population,
    treasury,
    displayName,
    powerLabel,
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
    desc: tDossier({ name: summary.name, rank }),
    defaultGovernment,
  };
}

function mapManifestToNationDetails(
  manifest: FinalMapManifest | null,
  tDossier: (values: { name: string; rank: number }) => string,
  tPowerTiers: (key: string) => string,
  formatCountryName: (code: string) => string,
): NationDetail[] {
  const manifestItems = manifest?.nations?.length
    ? manifest.nations
    : CountryRegistry.getAllManifestNations();

  if (!manifestItems || manifestItems.length === 0) {
    const profiles = CountryRegistry.getAllProfiles();
    return profiles.map((p, idx) => {
      const gdp = p.gdp || 50_000_000_000;
      const pop = p.population || 10_000_000;
      const treasury = Math.floor(gdp * ECONOMY_CONFIG.STARTING_TREASURY_RATIO);
      const rank = idx + 1;
      const gov = p.startingGovernment || "PLURALIST_PARLIAMENTARY";

      return createNationDetailItem(
        p.code,
        p.code,
        p.flagCode,
        rank,
        gdp,
        pop,
        treasury,
        gov,
        formatCountryName,
        tPowerTiers,
        tDossier,
      );
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
      Math.floor(gdp * ECONOMY_CONFIG.STARTING_TREASURY_RATIO);
    const rank = item.initialRank || 1;
    const gov =
      item.defaultGovernment ||
      profile?.startingGovernment ||
      "PLURALIST_PARLIAMENTARY";

    return createNationDetailItem(
      canonicalId,
      item.code || canonicalId,
      item.flagCode || profile?.flagCode,
      rank,
      gdp,
      population,
      treasury,
      gov,
      formatCountryName,
      tPowerTiers,
      tDossier,
    );
  });
}

export function useSelectNationForm() {
  const router = useRouter();
  const tDossier = useTranslations("selectNation.dossier");
  const tPowerTiers = useTranslations("selectNation.powerTiers");
  const tErrors = useTranslations("common.errors");
  const { showToast } = useToast();
  const createCampaignStore = useGameStore((state) => state.createCampaign);

  const { formatCountryName } = useLocaleFormatter();

  const [manifest, setManifest] = useState<FinalMapManifest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);
  const [userSelectedGovernment, setUserSelectedGovernment] = useState<
    string | null
  >(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GameDifficulty>("NORMAL");

  useEffect(() => {
    let active = true;

    async function loadManifest() {
      try {
        const loadedManifest =
          await ClientFinalStateLoader.ensureManifestLoaded("map1");
        if (
          active &&
          loadedManifest &&
          Array.isArray(loadedManifest.nations) &&
          loadedManifest.nations.length > 0
        ) {
          setManifest(loadedManifest);
        }
      } catch (err) {
        console.error("loadManifest error in useSelectNationForm:", err);
      }
    }

    loadManifest();
    return () => {
      active = false;
    };
  }, []);

  const allNations = useMemo(
    () =>
      mapManifestToNationDetails(
        manifest,
        (values) => tDossier("template", values),
        (key) => tPowerTiers(key),
        formatCountryName,
      ),
    [manifest, tDossier, tPowerTiers, formatCountryName],
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
    TacticalSound.playUiClick();
    setSelectedNationId(nation.id);
    setUserSelectedGovernment(nation.defaultGovernment);
  }, []);

  const setSelectedGovernment = useCallback((gov: string) => {
    TacticalSound.playUiClick();
    setUserSelectedGovernment(gov);
  }, []);

  const handleSelectDifficulty = useCallback((diff: GameDifficulty) => {
    TacticalSound.playUiClick();
    setSelectedDifficulty(diff);
  }, []);

  const handleStartCampaign = useCallback(async () => {
    if (!selectedNation) return;

    try {
      TacticalSound.playTurnAdvance();
      const { gameId } = await BitPackedInitService.initializeBitPackedSession(
        selectedNation.id,
      );
      const success = await createCampaignStore(
        selectedNation.id,
        selectedGovernment,
        gameId,
        manifest,
        selectedDifficulty,
      );

      if (success) {
        router.push(`/play/${gameId}`);
      } else {
        showToast(
          tErrors("actionFailedTitle"),
          tErrors("campaignCreateFailed"),
          "error",
        );
      }
    } catch (err) {
      console.error("handleStartCampaign error:", err);
      showToast(
        tErrors("actionFailedTitle"),
        tErrors("campaignSaveFailed"),
        "error",
      );
    }
  }, [
    selectedNation,
    selectedGovernment,
    selectedDifficulty,
    createCampaignStore,
    manifest,
    router,
    showToast,
    tErrors,
  ]);

  return {
    allNations,
    searchQuery,
    selectedNation,
    selectedGovernment,
    selectedDifficulty,
    setSearchQuery,
    setSelectedGovernment,
    setSelectedDifficulty: handleSelectDifficulty,
    handleSelectNationCard,
    handleStartCampaign,
  };
}
