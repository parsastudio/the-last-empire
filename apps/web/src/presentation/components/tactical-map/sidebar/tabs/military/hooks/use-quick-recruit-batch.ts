import { useState, useMemo, useCallback } from "react";
import {
  UnitType,
  MILITARY_UNIT_STATS,
  MilitaryPricingCalculator,
  MilitaryQuotaCalculator,
  ActionFactory,
  Nation,
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
  remainingRoom: number;
  isCapReached: boolean;
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
  nation: Nation;
  currentGdp: number;
  hasSeaAccess?: boolean;
}

export function useQuickRecruitBatch({
  nationId,
  nation,
  currentGdp,
  hasSeaAccess = true,
}: UseQuickRecruitBatchProps) {
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

  const tenPercentBudget = Math.max(0, Math.floor(nation.treasury * 0.1));
  const currentValuation =
    MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);
  const maxValuation = Math.floor(currentGdp);

  let queuedCost = 0;
  for (let i = 0; i < (nation.recruitmentQueue || []).length; i++) {
    queuedCost += nation.recruitmentQueue[i]!.totalCost;
  }

  const remainingValuationCapacity = Math.max(
    0,
    maxValuation - (currentValuation + queuedCost),
  );

  const quotas = useMemo(() => {
    return MilitaryQuotaCalculator.calculateQuotas(
      currentGdp,
      nation.military,
      hasSeaAccess,
      nation.recruitmentQueue,
    );
  }, [currentGdp, nation.military, hasSeaAccess, nation.recruitmentQueue]);

  const batchList = useMemo<QuickUnitBatchInfo[]>(() => {
    return ALL_TYPES.map((type) => {
      const stat = MILITARY_UNIT_STATS[type];
      const unitPrice = stat.moneyCost;
      const q = quotas[type];
      const isUnlocked =
        Math.floor(nation.military.techLevel) >= stat.requiredTechLevel;

      const affordableByMoney =
        tenPercentBudget > 0 && unitPrice > 0
          ? Math.max(1, Math.floor(tenPercentBudget / unitPrice))
          : 0;

      const affordableByValuationCap = Math.floor(
        remainingValuationCapacity / unitPrice,
      );
      const allowedByQuota = q.remainingRoom;

      const clampedQuantity = Math.max(
        0,
        Math.min(affordableByMoney, affordableByValuationCap, allowedByQuota),
      );

      const isCapReached =
        q.remainingRoom <= 0 || remainingValuationCapacity < unitPrice;
      const batchQuantity = clampedQuantity > 0 ? clampedQuantity : 1;
      const batchCost = batchQuantity * unitPrice;
      const canAfford =
        nation.treasury >= batchCost && clampedQuantity > 0 && !isCapReached;

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
        remainingRoom: q.remainingRoom,
        isCapReached,
      };
    });
  }, [
    nation.treasury,
    nation.military.techLevel,
    tenPercentBudget,
    quotas,
    remainingValuationCapacity,
  ]);

  const handleBuyBatch = useCallback(
    async (info: QuickUnitBatchInfo) => {
      if (!info.isUnlocked || !info.canAfford || info.isCapReached) return;

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
