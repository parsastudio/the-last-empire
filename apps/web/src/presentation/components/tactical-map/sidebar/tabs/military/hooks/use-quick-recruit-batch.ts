import { useState, useMemo, useCallback } from "react";
import {
  UnitType,
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  ActionFactory,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

export interface QuickUnitBatchInfo {
  type: UnitType;
  nameFa: string;
  unitPrice: number;
  batchQuantity: number;
  batchCost: number;
  buildTurns: number;
  requiredTechLevel: number;
  isUnlocked: boolean;
  canAfford: boolean;
}

export interface FloatingFeedback {
  id: string;
  text: string;
}

const ALL_TYPES: UnitType[] = [
  "INFANTRY",
  "ARMOR",
  "AIR_DEFENSE",
  "AIR_FORCE",
  "DRONE_MISSILE",
  "NAVAL_FLEET",
];

interface UseQuickRecruitBatchProps {
  nationId: string;
  currentTreasury: number;
  techLevel?: number;
  industrialLevel?: number;
}

export function useQuickRecruitBatch({
  nationId,
  currentTreasury,
  techLevel = 1,
  industrialLevel = 1,
}: UseQuickRecruitBatchProps) {
  const { dispatchAction } = useGameActions();
  const [snapshotTreasury] = useState<number>(() => currentTreasury);
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

  const tenPercentBudget = Math.max(0, Math.floor(snapshotTreasury * 0.1));

  const batchList = useMemo<QuickUnitBatchInfo[]>(() => {
    return ALL_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        type,
        techLevel,
        industrialLevel,
      );

      const isUnlocked = techLevel >= stat.requiredTechLevel;
      const batchQuantity =
        tenPercentBudget > 0 && unitPrice > 0
          ? Math.max(1, Math.floor(tenPercentBudget / unitPrice))
          : 1;

      const batchCost = batchQuantity * unitPrice;
      const canAfford = currentTreasury >= batchCost;

      return {
        type,
        nameFa: stat.nameFa,
        unitPrice,
        batchQuantity,
        batchCost,
        buildTurns: stat.buildTurns,
        requiredTechLevel: stat.requiredTechLevel,
        isUnlocked,
        canAfford,
      };
    });
  }, [
    snapshotTreasury,
    tenPercentBudget,
    techLevel,
    industrialLevel,
    currentTreasury,
  ]);

  const handleBuyBatch = useCallback(
    async (info: QuickUnitBatchInfo) => {
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

      const action = ActionFactory.recruitUnit(
        nationId,
        info.type,
        info.batchQuantity,
      );

      await dispatchAction(action);
    },
    [nationId, dispatchAction],
  );

  return {
    batchList,
    floatingFeedbacks,
    handleBuyBatch,
  };
}
