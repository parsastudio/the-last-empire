import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { EspionageManager } from "@/engine/espionage/espionage-manager";
import {
  EspionageTier,
  EspionageExecutionResult,
} from "@/domain/espionage/espionage.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { EspionageTargetOption } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-target-selector";
import { NationGettersUtility } from "@geopolitics/domain";

interface UseWideEspionageFormProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  selectedTargetCode?: string | null;
}

export function useWideEspionageForm({
  nation,
  nationsMap,
  provincesMap,
  selectedTargetCode,
}: UseWideEspionageFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastResult, setLastResult] = useState<EspionageExecutionResult | null>(
    null,
  );
  const { dispatchAction, isSubmitting } = useGameActions();

  const sourceRank = useMemo(() => {
    return NationGettersUtility.getRank(nation.id, nationsMap, provincesMap);
  }, [nation.id, nationsMap, provincesMap]);

  const countryOptions = useMemo<EspionageTargetOption[]>(() => {
    if (!nationsMap) return [];
    const query = searchQuery.trim().toLowerCase();
    const rankLookup = NationGettersUtility.calculateRankMap(
      nationsMap,
      provincesMap,
    );

    return Object.values(nationsMap)
      .filter((n) => n.id !== nation.id && n.isAlive)
      .map((n) => {
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        const rank = rankLookup.get(canonical) ?? 99;

        return {
          id: canonical,
          name: n.name,
          flagCode: n.flagCode || "IR",
          rank,
          gdp: getNationGdp(n, provincesMap),
          militaryTechLevel: n.military.techLevel,
        };
      })
      .filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.flagCode.toLowerCase().includes(query),
      )
      .sort((a, b) => b.gdp - a.gdp);
  }, [nationsMap, provincesMap, nation.id, searchQuery]);

  const defaultTarget = useMemo(() => {
    if (selectedTargetCode) {
      const cleanCode = CountryRegistry.resolveCanonicalId(selectedTargetCode);
      const matched = countryOptions.find(
        (c) =>
          c.id.toUpperCase() === cleanCode ||
          c.flagCode.toUpperCase() === cleanCode,
      );
      if (matched) return matched.id;
    }
    return countryOptions[0]?.id || "";
  }, [selectedTargetCode, countryOptions]);

  const [selectedTargetId, setSelectedTargetId] =
    useState<string>(defaultTarget);

  const selectedTargetNation = useMemo(() => {
    if (!nationsMap || !selectedTargetId) return null;
    const canonical = CountryRegistry.resolveCanonicalId(selectedTargetId);
    return nationsMap[canonical] || nationsMap[selectedTargetId] || null;
  }, [nationsMap, selectedTargetId]);

  const targetRank = useMemo(() => {
    if (!selectedTargetNation) return 50;
    return NationGettersUtility.getRank(
      selectedTargetNation.id,
      nationsMap,
      provincesMap,
    );
  }, [selectedTargetNation, nationsMap, provincesMap]);

  const targetGdp = useMemo(() => {
    if (!selectedTargetNation) return 1000000000;
    return getNationGdp(selectedTargetNation, provincesMap);
  }, [selectedTargetNation, provincesMap]);

  const tier2Cost = useMemo(
    () => EspionageManager.calculateOperationCost(targetGdp, 2),
    [targetGdp],
  );
  const tier3Cost = useMemo(
    () => EspionageManager.calculateOperationCost(targetGdp, 3),
    [targetGdp],
  );

  const tier2SuccessRate = useMemo(
    () => EspionageManager.calculateSuccessRate(2, sourceRank, targetRank),
    [sourceRank, targetRank],
  );
  const tier3SuccessRate = useMemo(
    () => EspionageManager.calculateSuccessRate(3, sourceRank, targetRank),
    [sourceRank, targetRank],
  );

  const techSuperiority = useMemo(() => {
    if (!selectedTargetNation) {
      return {
        militaryDelta: 0,
        totalAvailablePoints: 0,
      };
    }
    return EspionageManager.calculateTechSuperiority(
      nation,
      selectedTargetNation,
    );
  }, [nation, selectedTargetNation]);

  const isTierExecuted = useCallback(
    (tier: EspionageTier) => {
      if (!selectedTargetId) return false;
      const canonical = CountryRegistry.resolveCanonicalId(selectedTargetId);
      const list = nation.executedEspionageTiers || [];
      return (
        list.includes(`${canonical}:${tier}`) ||
        list.includes(`${selectedTargetId}:${tier}`)
      );
    },
    [selectedTargetId, nation.executedEspionageTiers],
  );

  const handleExecute = useCallback(
    async (tier: EspionageTier) => {
      if (!selectedTargetNation || isSubmitting) return;

      const action = ActionFactory.executeEspionage(
        nation.id,
        selectedTargetNation.id,
        tier,
      );

      const response = await dispatchAction(action);
      if (response.success && response.resultData) {
        setLastResult(response.resultData as EspionageExecutionResult);
      }
    },
    [nation.id, selectedTargetNation, isSubmitting, dispatchAction],
  );

  return {
    searchQuery,
    setSearchQuery,
    countryOptions,
    selectedTargetId,
    setSelectedTargetId,
    selectedTargetNation,
    targetGdp,
    tier2Cost,
    tier3Cost,
    tier2SuccessRate,
    tier3SuccessRate,
    techSuperiority,
    isTierExecuted,
    lastResult,
    isSubmitting,
    handleExecute,
  };
}
