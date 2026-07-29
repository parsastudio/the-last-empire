import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface TargetCountryOption {
  id: string;
  name: string;
  flagCode: string;
  stability: number;
  gdp: number;
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
    return Math.floor(selectedTargetNation.gdp * (desiredDrain / 2) * 0.01);
  }, [selectedTargetNation, desiredDrain]);

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
    handleFundProxy,
  };
}
