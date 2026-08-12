import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { useActionRunner } from "@/presentation/hooks/game/use-action-runner";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ProxyWarManager } from "@/engine/politics/proxy-war-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export interface TargetCountryOption {
  id: string;
  name: string;
  flagCode: string;
  stability: number;
  gdp: number;
}

interface UseWideProxyFormProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  selectedTargetCode?: string | null;
}

export function useWideProxyForm({
  nation,
  nationsMap,
  selectedTargetCode,
}: UseWideProxyFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [desiredDrain, setDesiredDrain] = useState<number>(2);
  const { runAction, isSubmitting } = useActionRunner();

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
        gdp: getNationGdp(n),
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
    return countryOptions[0]?.id || "";
  }, [selectedTargetCode, countryOptions]);

  const [selectedTargetId, setSelectedTargetId] =
    useState<string>(defaultTarget);

  const selectedTargetNation = useMemo(() => {
    return countryOptions.find((c) => c.id === selectedTargetId) || null;
  }, [countryOptions, selectedTargetId]);

  const requiredBudget = useMemo(() => {
    if (!selectedTargetNation) return 0;
    return ProxyWarManager.calculateBudget(
      selectedTargetNation.gdp,
      desiredDrain,
    );
  }, [selectedTargetNation, desiredDrain]);

  const canAfford = nation.treasury >= requiredBudget;

  const handleFundProxy = useCallback(async () => {
    if (!selectedTargetNation || requiredBudget <= 0 || !canAfford) return;

    const action = ActionFactory.fundProxyInfluence(
      nation.id,
      selectedTargetId,
      requiredBudget,
    );

    const formattedCost = PersianNumberFormatter.formatCurrency(requiredBudget);

    await runAction(
      action,
      `عملیات پنهان علیه ${selectedTargetNation.name} با موفقیت اجرا شد. ثبات کشور هدف به میزان -${PersianNumberFormatter.toPersianDigits(desiredDrain)}٪ کاهش یافت. (هزینه: ${formattedCost})`,
    );
  }, [
    nation.id,
    selectedTargetId,
    requiredBudget,
    desiredDrain,
    selectedTargetNation,
    canAfford,
    runAction,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    desiredDrain,
    setDesiredDrain,
    countryOptions,
    selectedTargetId,
    setSelectedTargetId,
    selectedTargetNation,
    requiredBudget,
    canAfford,
    isSubmitting,
    handleFundProxy,
  };
}
