import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { useLiveNations } from "@/presentation/hooks/game/use-live-nations";

export interface ActiveProxyOperation {
  targetId: string;
  targetName: string;
  targetFlagCode: string;
  currentBudget: number;
  stabilityDrainPerTurn: number;
  targetStability: number;
}

interface UseWideProxyProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function useWideProxy({
  nation,
  nationsMap,
  selectedTargetCode,
}: UseWideProxyProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allocatedBudget, setAllocatedBudget] = useState<number>(15000);
  const { dispatchAction } = useGameActions();

  const { filteredNations: countryOptions } = useLiveNations({
    nationsMap,
    excludeNationId: nation.id,
    searchQuery,
  });

  const defaultTarget = useMemo(() => {
    if (selectedTargetCode && nationsMap?.[selectedTargetCode]) {
      return selectedTargetCode;
    }
    return countryOptions[0]?.id || "NATION_15";
  }, [selectedTargetCode, nationsMap, countryOptions]);

  const [selectedTargetId, setSelectedTargetId] =
    useState<string>(defaultTarget);

  const activeOperations = useMemo<ActiveProxyOperation[]>(() => {
    if (!nation.proxyInfluenceBudget) return [];

    const list: ActiveProxyOperation[] = [];
    for (const [tId, budget] of Object.entries(nation.proxyInfluenceBudget)) {
      if (budget > 0) {
        const targetNation = nationsMap?.[tId];
        const targetName = targetNation ? targetNation.name : tId;
        const targetFlagCode = targetNation ? targetNation.flagCode : "IR";
        const targetStability = targetNation
          ? targetNation.government.stability
          : 50;

        const rawDrain = Math.floor(Math.log10(budget) * 3);
        const stabilityDrainPerTurn = Math.max(1, Math.min(15, rawDrain));

        list.push({
          targetId: tId,
          targetName,
          targetFlagCode,
          currentBudget: budget,
          stabilityDrainPerTurn,
          targetStability,
        });
      }
    }
    return list;
  }, [nation.proxyInfluenceBudget, nationsMap]);

  const selectedTargetNation = useMemo(() => {
    return countryOptions.find((c) => c.id === selectedTargetId) || null;
  }, [countryOptions, selectedTargetId]);

  const predictedStabilityDrain = useMemo(() => {
    if (allocatedBudget <= 0) return 0;
    const rawDrain = Math.floor(Math.log10(allocatedBudget) * 3);
    return Math.max(1, Math.min(15, rawDrain));
  }, [allocatedBudget]);

  const handleFundProxy = useCallback(async () => {
    if (!selectedTargetNation || allocatedBudget <= 0) return;

    const action = ActionFactory.fundProxyInfluence(
      nation.id,
      selectedTargetId,
      allocatedBudget,
    );

    await dispatchAction(
      action,
      `مبلغ $${allocatedBudget.toLocaleString("fa-IR")} جهت توسعه جنگ نیابتی علیه ${selectedTargetNation.name} اختصاص یافت.`,
    );
  }, [
    nation.id,
    selectedTargetId,
    allocatedBudget,
    selectedTargetNation,
    dispatchAction,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTargetId,
    setSelectedTargetId,
    allocatedBudget,
    setAllocatedBudget,
    filteredTargetOptions: countryOptions,
    selectedTargetNation,
    predictedStabilityDrain,
    activeOperations,
    handleFundProxy,
  };
}
