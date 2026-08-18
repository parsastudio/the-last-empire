import { useState, useCallback, useMemo } from "react";
import { UnitConfig } from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { UnitType } from "@/domain/military/military.schema";

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
    return MilitaryPricingCalculator.calculateUnitTypePrice(
      unit.type as UnitType,
      techLevel,
      industrialLevel,
    );
  }, [unit.type, techLevel, industrialLevel]);

  const maxAffordable = useMemo(() => {
    return MilitaryPricingCalculator.calculateMaxAffordable(
      treasury,
      unitUnitPrice,
    );
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
