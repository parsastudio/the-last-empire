import { useState, useMemo, useCallback } from "react";
import {
  UnitType,
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  ActionFactory,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { Nation } from "@/domain/nation/nation.schema";
import { FloatingFeedback } from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-quick-recruit-batch";

export interface AlliedUnitProcurementInfo {
  type: UnitType;
  nameFa: string;
  sellerUnitPrice: number;
  unitPrice: number;
  batchQuantity: number;
  batchCost: number;
  requiredTechLevel: number;
  isUnlocked: boolean;
  canAfford: boolean;
}

const ALL_TYPES: UnitType[] = [
  "INFANTRY",
  "ARMOR",
  "AIR_DEFENSE",
  "AIR_FORCE",
  "DRONE_MISSILE",
  "NAVAL_FLEET",
];

interface UseAlliedArmsProcurementProps {
  buyerNation: Nation;
  sellerNation: Nation;
}

export function useAlliedArmsProcurement({
  buyerNation,
  sellerNation,
}: UseAlliedArmsProcurementProps) {
  const { dispatchAction } = useGameActions();
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<
    Record<UnitType, FloatingFeedback[]>
  >({
    INFANTRY: [],
    ARMOR: [],
    AIR_DEFENSE: [],
    AIR_FORCE: [],
    DRONE_MISSILE: [],
    NAVAL_FLEET: [],
  });

  const tenPercentBudget = Math.max(0, Math.floor(buyerNation.treasury * 0.1));

  const batchList = useMemo<AlliedUnitProcurementInfo[]>(() => {
    return ALL_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const baseCost = MilitaryPricingCalculator.calculateUnitTypePrice(
        type,
        sellerNation.military.techLevel,
        sellerNation.industrialLevel,
      );

      const marketUnitPrice = Math.floor(baseCost * 1.5);
      const isUnlocked =
        sellerNation.military.techLevel >= stat.requiredTechLevel;

      const batchQuantity =
        tenPercentBudget > 0 && marketUnitPrice > 0
          ? Math.max(1, Math.floor(tenPercentBudget / marketUnitPrice))
          : 1;

      const batchCost = batchQuantity * marketUnitPrice;
      const canAfford = buyerNation.treasury >= batchCost;

      return {
        type,
        nameFa: stat.nameFa,
        sellerUnitPrice: baseCost,
        unitPrice: marketUnitPrice,
        batchQuantity,
        batchCost,
        requiredTechLevel: stat.requiredTechLevel,
        isUnlocked,
        canAfford,
      };
    });
  }, [buyerNation.treasury, sellerNation, tenPercentBudget]);

  const handleBuyAlliedBatch = useCallback(
    async (info: AlliedUnitProcurementInfo) => {
      if (!info.isUnlocked || !info.canAfford) return;

      TacticalSound.playCoinSound();

      const newId = `${Date.now()}-${Math.random()}`;
      setFloatingFeedbacks((prev) => ({
        ...prev,
        [info.type]: [
          ...prev[info.type],
          {
            id: newId,
            text: `+${info.batchQuantity}`,
          },
        ],
      }));

      setTimeout(() => {
        setFloatingFeedbacks((prev) => ({
          ...prev,
          [info.type]: prev[info.type].filter((f) => f.id !== newId),
        }));
      }, 600);

      const action = ActionFactory.buyArmsMarket(
        buyerNation.id,
        sellerNation.id,
        info.type,
        info.batchQuantity,
      );

      await dispatchAction(action);
    },
    [buyerNation.id, sellerNation.id, dispatchAction],
  );

  return {
    batchList,
    floatingFeedbacks,
    handleBuyAlliedBatch,
  };
}
