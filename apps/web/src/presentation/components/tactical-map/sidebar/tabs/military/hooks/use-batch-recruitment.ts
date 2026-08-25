import { useState, useMemo, useCallback } from "react";
import {
  UnitType,
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  ActionFactory,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

const ALL_UNIT_TYPES: UnitType[] = [
  "INFANTRY",
  "DRONE_MISSILE",
  "ARMOR",
  "AIR_DEFENSE",
  "AIR_FORCE",
  "NAVAL_FLEET",
];

interface UseBatchRecruitmentProps {
  nationId: string;
  treasury: number;
  techLevel?: number;
  industrialLevel?: number;
  onClose: () => void;
}

export function useBatchRecruitment({
  nationId,
  treasury,
  techLevel = 1,
  industrialLevel = 1,
  onClose,
}: UseBatchRecruitmentProps) {
  const { dispatchAction, isSubmitting } = useGameActions();

  const [quantities, setQuantities] = useState<Record<UnitType, number>>({
    INFANTRY: 0,
    DRONE_MISSILE: 0,
    ARMOR: 0,
    AIR_DEFENSE: 0,
    AIR_FORCE: 0,
    NAVAL_FLEET: 0,
  });

  const unitConfigs = useMemo(() => {
    const fivePercentTreasury = Math.floor(treasury * 0.05);

    return ALL_UNIT_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        type,
        techLevel,
        industrialLevel,
      );
      const isUnlocked = techLevel >= stat.requiredTechLevel;

      let step = 1;
      if (fivePercentTreasury > 0 && unitPrice <= fivePercentTreasury) {
        step = Math.max(1, Math.floor(fivePercentTreasury / unitPrice));
      }

      return {
        type,
        stat,
        unitPrice,
        isUnlocked,
        step,
      };
    });
  }, [treasury, techLevel, industrialLevel]);

  const pricesMap = useMemo(() => {
    const map = new Map<UnitType, number>();
    for (const conf of unitConfigs) {
      map.set(conf.type, conf.unitPrice);
    }
    return map;
  }, [unitConfigs]);

  const totalCost = useMemo(() => {
    let sum = 0;
    for (const type of ALL_UNIT_TYPES) {
      const qty = quantities[type] || 0;
      const price = pricesMap.get(type) || 0;
      sum += qty * price;
    }
    return sum;
  }, [quantities, pricesMap]);

  const remainingTreasury = Math.max(0, treasury - totalCost);

  const getOtherUnitsCost = useCallback(
    (targetType: UnitType): number => {
      let sum = 0;
      for (const type of ALL_UNIT_TYPES) {
        if (type === targetType) continue;
        const qty = quantities[type] || 0;
        const price = pricesMap.get(type) || 0;
        sum += qty * price;
      }
      return sum;
    },
    [quantities, pricesMap],
  );

  const handleQuantityChange = useCallback(
    (type: UnitType, requestedQty: number) => {
      const price = pricesMap.get(type) || 0;
      if (price <= 0) return;

      const otherCost = getOtherUnitsCost(type);
      const budgetLeftForThis = Math.max(0, treasury - otherCost);
      const maxAffordableForThis = Math.floor(budgetLeftForThis / price);

      const clampedQty = Math.max(
        0,
        Math.min(maxAffordableForThis, requestedQty),
      );

      setQuantities((prev) => ({
        ...prev,
        [type]: clampedQty,
      }));
    },
    [pricesMap, getOtherUnitsCost, treasury],
  );

  const handleResetAll = useCallback(() => {
    setQuantities({
      INFANTRY: 0,
      DRONE_MISSILE: 0,
      ARMOR: 0,
      AIR_DEFENSE: 0,
      AIR_FORCE: 0,
      NAVAL_FLEET: 0,
    });
  }, []);

  const handleBatchSubmit = useCallback(async () => {
    if (totalCost <= 0 || totalCost > treasury || isSubmitting) {
      return;
    }

    const ordersToDispatch = ALL_UNIT_TYPES.filter(
      (type) => (quantities[type] || 0) > 0,
    );

    if (ordersToDispatch.length === 0) return;

    for (const type of ordersToDispatch) {
      const qty = quantities[type]!;
      const action = ActionFactory.recruitUnit(nationId, type, qty);
      await dispatchAction(action);
    }

    onClose();
  }, [
    totalCost,
    treasury,
    isSubmitting,
    quantities,
    nationId,
    dispatchAction,
    onClose,
  ]);

  return {
    unitConfigs,
    quantities,
    totalCost,
    remainingTreasury,
    isSubmitting,
    handleQuantityChange,
    handleResetAll,
    handleBatchSubmit,
    getOtherUnitsCost,
  };
}
