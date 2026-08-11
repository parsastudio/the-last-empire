import { useState, useCallback, useMemo } from "react";
import { UnitConfig } from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";

interface UseUnitRecruitmentCalculatorProps {
  unit: UnitConfig;
  treasury: number;
}

export function useUnitRecruitmentCalculator({
  unit,
  treasury,
}: UseUnitRecruitmentCalculatorProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const maxAffordable = useMemo(() => {
    return unit.moneyCost > 0 ? Math.floor(treasury / unit.moneyCost) : 0;
  }, [treasury, unit]);

  const currentQty = Math.min(quantity, maxAffordable);
  const totalMoney = unit.moneyCost * currentQty;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (isNaN(val)) {
        setQuantity(0);
        return;
      }
      const clamped = Math.max(0, Math.min(maxAffordable, val));
      setQuantity(clamped);
    },
    [maxAffordable],
  );

  const handlePercentageSelect = useCallback(
    (percentage: number) => {
      const target = Math.floor(maxAffordable * percentage);
      setQuantity(target);
    },
    [maxAffordable],
  );

  const setClampedQuantity = useCallback(
    (amount: number) => {
      setQuantity(Math.max(0, Math.min(maxAffordable, amount)));
    },
    [maxAffordable],
  );

  return {
    quantity: currentQty,
    maxAffordable,
    totalMoney,
    handleInputChange,
    handlePercentageSelect,
    setClampedQuantity,
  };
}
