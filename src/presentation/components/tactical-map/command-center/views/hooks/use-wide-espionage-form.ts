import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
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

interface UseWideEspionageFormProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function useWideEspionageForm({
  nation,
  nationsMap,
  selectedTargetCode,
}: UseWideEspionageFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastResult, setLastResult] = useState<EspionageExecutionResult | null>(
    null,
  );
  const { dispatchAction, isSubmitting } = useGameActions();

  const countryOptions = useMemo<EspionageTargetOption[]>(() => {
    if (!nationsMap) return [];
    const query = searchQuery.trim().toLowerCase();

    return Object.values(nationsMap)
      .filter((n) => n.id !== nation.id && n.isAlive)
      .map((n) => ({
        id: CountryRegistry.resolveCanonicalId(n.id),
        name: n.name,
        flagCode: n.flagCode || "IR",
        rank: n.rank || 99,
        gdp: getNationGdp(n),
        militaryTechLevel: n.military.techLevel,
        industrialLevel: n.industrialLevel,
        infrastructureLevel: n.geography.infrastructureLevel,
      }))
      .filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.flagCode.toLowerCase().includes(query),
      )
      .sort((a, b) => b.gdp - a.gdp);
  }, [nationsMap, nation.id, searchQuery]);

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

  const targetGdp = useMemo(() => {
    if (!selectedTargetNation) return 1000000000;
    return getNationGdp(selectedTargetNation);
  }, [selectedTargetNation]);

  const tier1Cost = useMemo(
    () => EspionageManager.calculateOperationCost(targetGdp, 1, nation),
    [targetGdp, nation],
  );
  const tier2Cost = useMemo(
    () => EspionageManager.calculateOperationCost(targetGdp, 2, nation),
    [targetGdp, nation],
  );
  const tier3Cost = useMemo(
    () => EspionageManager.calculateOperationCost(targetGdp, 3, nation),
    [targetGdp, nation],
  );

  const tier1SuccessRate = useMemo(
    () => EspionageManager.calculateSuccessRate(1, nation),
    [nation],
  );
  const tier2SuccessRate = useMemo(
    () => EspionageManager.calculateSuccessRate(2, nation),
    [nation],
  );
  const tier3SuccessRate = useMemo(
    () => EspionageManager.calculateSuccessRate(3, nation),
    [nation],
  );

  const techSuperiority = useMemo(() => {
    if (!selectedTargetNation) {
      return {
        militaryDelta: 0,
        industrialDelta: 0,
        infrastructureDelta: 0,
        totalAvailablePoints: 0,
      };
    }
    return EspionageManager.calculateTechSuperiority(
      nation,
      selectedTargetNation,
    );
  }, [nation, selectedTargetNation]);

  const executedTiers = nation.executedEspionageTiers || [];

  const handleExecute = useCallback(
    async (tier: EspionageTier) => {
      if (!selectedTargetNation || isSubmitting) return;

      const action = ActionFactory.executeEspionage(
        nation.id,
        selectedTargetNation.id,
        tier,
      );

      const success = await dispatchAction(action);
      if (success) {
        setLastResult(null);
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
    tier1Cost,
    tier2Cost,
    tier3Cost,
    tier1SuccessRate,
    tier2SuccessRate,
    tier3SuccessRate,
    techSuperiority,
    executedTiers,
    lastResult,
    isSubmitting,
    handleExecute,
  };
}
