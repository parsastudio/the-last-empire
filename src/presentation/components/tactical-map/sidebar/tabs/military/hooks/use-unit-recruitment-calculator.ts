import { useState, useCallback, useMemo } from "react";
import { UnitConfig } from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";

interface UseUnitRecruitmentCalculatorProps {
  unit: UnitConfig;
  treasury: number;
  techLevel?: number;
  industrialLevel?: number;
}

export function useUnitRecruitmentCalculator({
  unit,
  treasury,
  techLevel = 1,
  industrialLevel = 1,
}: UseUnitRecruitmentCalculatorProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const unitUnitPrice = useMemo(() => {
    const techMultiplier = 1 + (techLevel - 1) * 0.05;
    const discount = Math.max(0.7, 1 - (industrialLevel - 1) * 0.05);
    return Math.floor(unit.moneyCost * techMultiplier * discount);
  }, [unit.moneyCost, techLevel, industrialLevel]);

  const maxAffordable = useMemo(() => {
    return unitUnitPrice > 0 ? Math.floor(treasury / unitUnitPrice) : 0;
  }, [treasury, unitUnitPrice]);

  const currentQty = Math.min(quantity, maxAffordable);
  const totalMoney = unitUnitPrice * currentQty;

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
    unitUnitPrice,
    handleInputChange,
    handlePercentageSelect,
    setClampedQuantity,
  };
}
