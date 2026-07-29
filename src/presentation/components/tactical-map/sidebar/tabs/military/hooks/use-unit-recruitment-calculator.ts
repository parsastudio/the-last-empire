import { useState, useCallback, useMemo } from "react";
import { UnitConfig } from "../recruitable-units.config";

interface UseUnitRecruitmentCalculatorProps {
  unit: UnitConfig;
  treasury: number;
  manpower: number;
  steel: number;
}

export function useUnitRecruitmentCalculator({
  unit,
  treasury,
  manpower,
  steel,
}: UseUnitRecruitmentCalculatorProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const maxAffordable = useMemo(() => {
    const maxMoney =
      unit.moneyCost > 0 ? Math.floor(treasury / unit.moneyCost) : Infinity;
    const maxManpower =
      unit.manpowerCost > 0
        ? Math.floor(manpower / unit.manpowerCost)
        : Infinity;
    const maxSteel =
      unit.steelCost > 0 ? Math.floor(steel / unit.steelCost) : Infinity;

    return Math.max(0, Math.min(maxMoney, maxManpower, maxSteel));
  }, [treasury, manpower, steel, unit]);

  const currentQty = Math.min(quantity, maxAffordable);

  const totalMoney = unit.moneyCost * currentQty;
  const totalManpower = unit.manpowerCost * currentQty;
  const totalSteel = unit.steelCost * currentQty;

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
    totalManpower,
    totalSteel,
    handleInputChange,
    handlePercentageSelect,
    setClampedQuantity,
  };
}
