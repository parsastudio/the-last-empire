import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { calculateProxyOperationBudget } from "@/domain/politics/proxy-operation-cost.utility";

export interface TargetCountryOption {
  id: string;
  name: string;
  flagCode: string;
  stability: number;
  gdp: number;
}

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
  const [desiredDrain, setDesiredDrain] = useState<number>(2);
  const { dispatchAction } = useGameActions();

  const countryOptions = useMemo<TargetCountryOption[]>(() => {
    if (!nationsMap) return [];
    const query = searchQuery.trim().toLowerCase();

    return Object.values(nationsMap)
      .filter((n) => n.id !== nation.id && n.isAlive)
      .map((n) => ({
        id: n.id,
        name: n.name,
        flagCode: n.flagCode || "IR",
        stability: n.government.stability,
        gdp: n.gdp,
      }))
      .filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.flagCode.toLowerCase().includes(query),
      );
  }, [nationsMap, nation.id, searchQuery]);

  const defaultTarget = useMemo(() => {
    if (selectedTargetCode) {
      const cleanCode = selectedTargetCode.toUpperCase();
      const matched = countryOptions.find(
        (c) =>
          c.id.toUpperCase() === cleanCode ||
          c.flagCode.toUpperCase() === cleanCode,
      );
      if (matched) return matched.id;
    }
    return countryOptions[0]?.id || "NATION_15";
  }, [selectedTargetCode, countryOptions]);

  const [selectedTargetId, setSelectedTargetId] =
    useState<string>(defaultTarget);

  const selectedTargetNation = useMemo(() => {
    return countryOptions.find((c) => c.id === selectedTargetId) || null;
  }, [countryOptions, selectedTargetId]);

  const requiredBudget = useMemo(() => {
    if (!selectedTargetNation) return 0;
    return calculateProxyOperationBudget(
      selectedTargetNation.gdp,
      desiredDrain,
    );
  }, [selectedTargetNation, desiredDrain]);

  const activeOperations = useMemo<ActiveProxyOperation[]>(() => {
    if (!nationsMap) return [];
    const ops: ActiveProxyOperation[] = [];

    for (const [targetId, budget] of Object.entries(
      nation.proxyInfluenceBudget || {},
    )) {
      if (budget > 0) {
        const target = nationsMap[targetId];
        if (target && target.isAlive) {
          const drain = Math.max(
            1,
            Math.min(15, Math.floor(Math.log10(budget) * 3)),
          );
          ops.push({
            targetId,
            targetName: target.name,
            targetFlagCode: target.flagCode || "IR",
            currentBudget: budget,
            stabilityDrainPerTurn: drain,
            targetStability: target.government.stability,
          });
        }
      }
    }

    return ops;
  }, [nation.proxyInfluenceBudget, nationsMap]);

  const handleFundProxy = useCallback(async () => {
    if (!selectedTargetNation || requiredBudget <= 0) return;

    const action = ActionFactory.fundProxyInfluence(
      nation.id,
      selectedTargetId,
      requiredBudget,
    );

    const formattedCost = PersianNumberFormatter.formatCurrency(requiredBudget);

    await dispatchAction(
      action,
      `عملیات پنهان علیه ${selectedTargetNation.name} با موفقیت اجرا شد. ثبات کشور هدف به میزان -${PersianNumberFormatter.toPersianDigits(desiredDrain)}٪ کاهش یافت. (هزینه: ${formattedCost})`,
    );
  }, [
    nation.id,
    selectedTargetId,
    requiredBudget,
    desiredDrain,
    selectedTargetNation,
    dispatchAction,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTargetId,
    setSelectedTargetId,
    desiredDrain,
    setDesiredDrain,
    requiredBudget,
    filteredTargetOptions: countryOptions,
    selectedTargetNation,
    activeOperations,
    handleFundProxy,
  };
}
